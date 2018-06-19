import babel from 'rollup-plugin-babel'

export default {
    input: './src/index.js',
    output: {
        file: 'bundle.js',
        format: 'cjs'
    },
    plugins:[
        babel()
    ],
    external: [ 'react', 'mobx-react', 'mobx', 'mobx-state-tree', 'query-string' ] 
}
