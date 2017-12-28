"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var update_notifier_1 = require("update-notifier");
var package_json_1 = require("../package.json");
update_notifier_1.default({ pkg: package_json_1.default }).notify();
//# sourceMappingURL=update-notifier.js.map