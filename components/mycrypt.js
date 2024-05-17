/**
 * Шифрование данных. В классе 2 метода:
 *  1 - 256 бит на key и encIv
 *  2 - на приватном и публичном ключах (https://whyboobo.com/devops/tutorials/asymmetric-encryption-with-nodejs/)
 *
 *  Пример использования для метода 2:
 *  const mycrypt = require("../components/mycrypt.js");
 *  const public_key = fs.readFileSync('./config/public_key.pem', 'utf8');
 *  const private_key = fs.readFileSync('./config/private_key.pem', 'utf8');
 *  mycrypt.setKeys(public_key, private_key);
 */
const crypto = require('node:crypto');
const axios  = require("axios");
const Log    = require("./log.js");

const encMethod = 'aes-256-cbc';

class MyCrypt extends Log {

    public_key = "";
    private_key = "";

    constructor() {
        super();
    }

    async getRemoteKeys(url, login, password) {
        this.d(".getRemoteKeys url:" + url);
        try {
            const res = await axios.get(url, {
                auth: {
                    username: login,
                    password: password
                }
            });
            if (res.data.status === 'OK') {
                this.setKeys(res.data.public, res.data.private);
            } else {
                console.log("Error get remote keys", res.data);
            }
        } catch (ex) {
            console.log(ex);
        }
        return false;
    }

    // region Метод 1
    setSecrets(secretKey, secretIV) {
        this.skey = crypto.createHash('sha512').update(secretKey).digest('hex').substring(0, 32);
        this.encIv = crypto.createHash('sha512').update(secretIV).digest('hex').substring(0, 16);
    }

    encryptData(data) {
        const cipher = crypto.createCipheriv(encMethod, self.skey, self.encIv);
        const encrypted = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
        return Buffer.from(encrypted).toString('base64');
    }

    decryptData(encryptedData) {
        const buff = Buffer.from(encryptedData, 'base64');
        encryptedData = buff.toString('utf-8');
        const decipher = crypto.createDecipheriv(encMethod, self.skey, self.encIv);
        return decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8');
    }
    // endregion

    // region Метод 2
    setKeys(public_key, private_key) {
        this.d(".setKeys");
        this.public_key = public_key;
        this.private_key = private_key;
    }

    /**
     * Шифрование с использованием приватного и публичного ключей
     * @param plainText
     * @returns {string}
     */
    encryptText(plainText) {
        return crypto.publicEncrypt({
                key: self.public_key,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(plainText)
        ).toString('base64');
    }

    /**
     * Шифрование с использованием приватного и публичного ключей
     * @param plainText
     * @returns {string}
     */
    decryptText(encryptedText) {
        const buf = Buffer.from(encryptedText, 'base64');
        return crypto.privateDecrypt(
            {
                key: self.private_key,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            buf
        ).toString();
    }
    // endregion

}

const self = new MyCrypt();
module.exports = self;