const fs = require("fs/promises");
const slugify = require("slugify");

module.exports = async (city) => {
    const cities = JSON.parse(await fs.readFile(`${__dirname}/../locations.json`)).locations;
    return cities.some(validCity => slugify(validCity, { lower: true }) === slugify(city, { lower: true }))
}