
// Utility functions //

function parseBool(value, defaultValue) {
    return (value == 'true' || value == 'false' || value === true || value === false) && JSON.parse(value) || defaultValue;
}

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function generateUuid() {
    return randomString(32, '0123456789abcdefghijklmnopqrstuvwxyz');
}

function clone_2d_arr(arr) {
    var res = [];
    for (var i = 0; i < arr.length; i++) {
        res[i] = arr[i].slice();
    }
    return res;
};

function conv_name(name) {
    if (name === -1) {
        return '';
    }
    return name;
}
