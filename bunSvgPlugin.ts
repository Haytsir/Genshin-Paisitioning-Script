import { plugin } from 'bun';

plugin({
    name: 'SVG',
    async setup(build) {
        const { transform } = await import('@svgr/core');
        const { readFileSync } = await import('fs');

        build.onLoad({ filter: /\.(svg)$/ }, async args => {
            const text = readFileSync(args.path, 'utf8');
            const contents = await transform(
                text,
                {
                    icon: true,
                    exportType: 'named',
                    plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
                },
                { componentName: 'ReactComponent' }
            );

            return {
                contents,
                loader: 'js', // not sure why js and not jsx, but it works only this way
            };
        });
    },
});