const fs = require('fs');

// Clears the /temp directory from
module.exports = {
	name: 'clearCache',
	description: 'Clears the cache of the bot',
	execute() {
        const dir = './tmp';
        if (!fs.existsSync(dir))
            return;

        const files = fs.readdirSync(`${dir}/`);

        files.forEach((file) => {
                try {
                    fs.unlinkSync(`${dir}/${file}`);
                } catch (err) {
                    console.log(err);
                }
            });
    },
}