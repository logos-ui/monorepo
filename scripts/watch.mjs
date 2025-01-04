import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import Nodemon from 'nodemon';

const __dirname = import.meta.dirname

const root = join(__dirname, '..');
const pkgPath = (name) => join(root, 'packages', name);

const args = process.argv.slice(2);
const existing = readdirSync('packages')
    .filter(
        name => statSync(
            join('packages', name)
        ).isDirectory()
    )
;


let packages = existing.filter(
    name => args.includes(name)
);

if (packages.length === 0) {
    packages = existing
}

const exec = packages.map(
    name => `cd ${pkgPath(name)} && pnpm run build`
).join(' ; ')

Nodemon({
    exec,
    watch: packages.map(name => pkgPath(`${name}/src`)),
    ext: 'ts,',
    stdout: false,
    stdin: true,
}).on('readable', function() {

    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
});