/**
 * Компонент для организации шины сообщений (EventBus)
 * для передачи сообщений между компонентами приложения
 */

let EventEmitter = require('events').EventEmitter;

let notifier = new EventEmitter();
notifier.setMaxListeners(20);

module.exports = notifier;