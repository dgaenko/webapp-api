/**
 * Sequelize, миграции, транзакции
 * https://www.youtube.com/watch?v=g8-xEfgU69s
 *
 */

const fs                  = require('fs');
const path                = require('path');
const Sequelize           = require('sequelize');
const { DataTypes }       = require("sequelize");
const { createNamespace } = require('cls-hooked');

const Log                 = require("./log.js");

const migrationsPath = path.join(process.cwd(), 'migrations');

class Db extends Log {

    name = "Db";
    configPath = '../config/config.json';

    models = {}

    constructor() {
        super();
        this.init()
    }

    get config() {
        const env = process.env.NODE_ENV || 'development';
        return require(this.configPath)[env];
    }

    init() {
        this.d(".init");
        const config = this.config;
        this.sequelize = new Sequelize(
            config.database,
            config.username,
            config.password,
            config
        );
        this.initTransactions();
        this.loadModels();
    }

    /**
     * для использования транзакций
     */
    initTransactions() {
        this.namespace = createNamespace('ns');
        Sequelize.useCLS(this.namespace);
    }

    /**
     * Загрузка моделей из папки models
     */
    loadModels() {
        this.d(".loadModels");
        const config = this.config;

        if (config.use_env_variable) {
            this.sequelize = new Sequelize(process.env[config.use_env_variable], config);
        } else {
            this.sequelize = new Sequelize(config.database, config.username, config.password, config);
        }

        const models_path = path.join(process.cwd(), "models");
        // Подключение моделей из папки models
        fs
            .readdirSync(models_path)
            .filter(file => {
                return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
            })
            .forEach(file => {
                const model = require(path.join(models_path, file))(this.sequelize, Sequelize.DataTypes);
                if (model.name) {
                    this.models[model.name] = model;
                }
            });

        // обработка связей моделей
        Object.keys(this.models).forEach(modelName => {
            if (this.models[modelName].associate) {
                this.models[modelName].associate(this.models);
            }
        });
    }

    /**
     * Соединение с БД
     */
    async openConnection() {
        this.d(".openConnection");
        await this.sequelize.authenticate();
        //await this.sequelize.sync({ force: false, alter: true });
    }

    /**
     * Закрытие соединения с БД
     */
    async closeConnection() {
        this.d(".closeConnection");
        await this.sequelize.close();
    }

    async runMigrations() {
        const queryInterface = this.sequelize.getQueryInterface();
        await queryInterface.createTable('_migrations', {
            filename: DataTypes.STRING,
            appliedAt: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.fn('current_timestamp'),
                allowNull: false
            }
        });

        this.d(`: Scan folder "${migrationsPath}" for migrations`, { scope: 'migrations' });

        const [list, migrations] = await Promise.all([
            readDir(migrationsPath),
            this.models.Migration.findAll()
        ]);

        for (const file of list) {
            if (!file.match(/\.js$/)) {
                continue;
            }
            const appliedMigration = migrations.find((migration) => migration.filename === file);
            if (appliedMigration) {
                this.d(`: Migration "${file}" was applied at ${appliedMigration.appliedAt}`, { scope: 'migrations' });
                continue;
            }
            this.d(`: Migration "${file}" applying...`, { scope: 'migrations' });

            const { up, down } = require(path.join(migrationsPath, file));

            if (!up || !down) {
                throw new Error(`Invalid migration functions in file ${file}`);
            }

            await up(queryInterface, Sequelize);

            const item = await this.models.Migration.create({
                filename: file,
                appliedAt: Date.now()
            });
            await item.save();
        }

        function readDir(dir) {
            return new Promise((resolve, reject) => {
                fs.readdir(dir, (errDir, files) => {
                    if (errDir) {
                        return reject(errDir);
                    }
                    return resolve(files);
                });
            });
        }
    }

    /**
     * Откат указанной миграции
     * @param name
     * @returns {Promise<void>}
     */
    async revertMigration(name) {
        const migrationFile = path.join(migrationsPath, name);

        this.d(`: Reverting "${migrationFile}"...`, { scope: 'migrations' });

        const migration = await this.models.Migration.findOne({
            where: { filename: name }
        });
        if (!migration) {
            throw new Error(`Migration "${name}" not applied`);
        }

        const { up, down } = require(migrationFile);

        if (!up || !down) {
            throw new Error(`Invalid migration functions in file ${migrationFile}`);
        }
        await down(this.sequelize.getQueryInterface(), Sequelize);
        await migration.destroy();
    }
}

const db = new Db();
module.exports = {
    db: db,
    models: db.models
};
