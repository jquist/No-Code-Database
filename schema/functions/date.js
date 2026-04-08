function getDate() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
};

module.exports = getDate;