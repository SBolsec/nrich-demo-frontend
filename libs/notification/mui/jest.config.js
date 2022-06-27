const sharedConfig = require('../../../config/jest/jest.config.js');

module.exports = {
  ...sharedConfig,
  setupFilesAfterEnv: ["../../../config/jest/jest.setup-jest-dom.js"],
  coverageDirectory: "../../../coverage/libs/notification/mui",
};
