const { roleMention } = require('discord.js');

const CID_BOTTESTING_CHANNEL = '887967982356148254';

const GID_KLEEJSTEST_ROLE = '1192966263065034782';

const MENTION_KLEEJSTEST_ROLE = roleMention(GID_KLEEJSTEST_ROLE);

module.exports = {
    CID_BOTTESTING_CHANNEL,
    GID_KLEEJSTEST_ROLE,
    MENTION_KLEEJSTEST_ROLE
}