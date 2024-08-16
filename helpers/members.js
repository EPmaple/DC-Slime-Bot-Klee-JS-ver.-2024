const { nameId, idName } = require('../consts/memberList');

/*
Input: memberId (type: string)
Output: name (type: string)
 */
function getName(memberId) {
    return idName[memberId];
}

/*
Output: idList (type: Array of String)
 */
/*
idName is an object having properties of id:name, and Object.entries is used to
turn it into an array of arrays, where each array represents one id:name. 'a' and
'b' are different entries.
    a[1].localeCompare(b[1]), we are comparing the second element, the name, of
each entry, lexicographically (in dictionary order) by .localeCompare
 */
function getIdListSortedByName() {
    const sortedName = Object.entries(idName).sort((a, b) =>
        a[1].localeCompare(b[1]));
    return sortedName.map(([id, name]) => id);
}

// const cachedIdListSortedByName = getIdListSortedByName();
//
// function idList() {
//     return cachedIdListSortedByName;
// }

/**
 * Attempt to provide the corresponding discord user ID from the message text. If
 * the text is a Discord mention, or if the text may represent a Discord user's name,
 * it is parsed accordingly and the user ID is returned. !!! 'text' is a parameter
 * that has been parsed previously and determined to contain the related info. !!!
 *
 * @param message
 * @param {string} text -
 * @returns {string|null}
 */
function idSearch(message, text) {
    // To handle the case where the text may be discord @mention
    if (text.startsWith('<@') && text.endsWith('>')) {
        let mentionedUserId;
        mentionedUserId = text.slice(2, -1); // To remove '<@' and '>'
        /*
        To handle nickname mention, where the ID would start with '!'
         */
        if (mentionedUserId.startsWith('!')) {
            mentionedUserId = mentionedUserId.slice(1);
        }
        return String(mentionedUserId); // Typecast to safeguard
    }

    // Getting here, text must be a name or nickname string
    /*
    Removes all characters after the first occurrence of non-alphanumeric characters
    'John$ Doe#42' => 'John'
    Note it does not take care of leading or trailing spaces
    */
    const cleanedNamePart = text.replace(/[^a-zA-Z0-9].*/, '');
    /*
    replace(/[^a-zA-Z0-9]+/g, '') removes all non-alphanumeric characters globally
    'John$ Doe#42' => 'JohnDoe42'
     */
    const namePartLower = cleanedNamePart.toLowerCase();

    // First, map 'me'
    if (namePartLower === 'me') {
        return String(message.author.id);
    }

    // Second, map if namePart matches name, iterate over key-value pairs using
    // Object.entries()
    for (const [name, id] of Object.entries(nameId)) {
        if (namePartLower === name.toLowerCase()) return String(id);
    }

    // Third, map if name begins with namePart
    for (const [name, id] of Object.entries(nameId)) {
        if (name.toLowerCase().startsWith(namePartLower)) return String(id);
    }

    // Lastly, map if name contains namePart
    for (const [name, id] of Object.entries(nameId)) {
        if (name.toLowerCase().includes(namePartLower)) return String(id);
    }

    return null;
}

module.exports = {
    getName, getIdListSortedByName,
    idSearch
}