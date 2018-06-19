//@flow

import queryString from 'query-string'
import type {RouterStore} from './mst-router-store'
import {getParent, types} from 'mobx-state-tree'
import {addHeadSlash, pathToIds} from './utils'

export type Params = { [key: string]: number | string };

export interface Route {
    +id: string;
    +route: string[];
    +positionedParams: string[];

    path: string;
    component: React$Node<*>;

    goTo(params?: Params, query?: { [key: string]: any }): void;

    replaceUrlParams(params?: Params, query?: { [key: string]: any }): string;

}


const RouteModel = types.model('MST_Route')
    .views((that: Route) => ({
        get route(): string[] {
            return pathToIds(that.path)
        },
        get positionedParams(): string[] {
            let result = []
            for (let i = 0; i < that.route.length; i++) {
                if (that.route[i][0] === ':') {
                    result.push(that.route[i].slice(1))
                }
            }

            return result
        },
        get id(): string {
            return that.route.map(rt => rt[0] === ':' ? '' : rt).join('/')
        }
    }))
    .actions((that: Route) => {
        return ({
            goTo(params, query) {
                (getParent(that, 2): RouterStore)
                    .goToUrl(that.replaceUrlParams(params, query))

            },

            replaceUrlParams(params, queryParams = {}) {

                if (that.positionedParams.length > 0) {
                    if (params !== undefined) {
                        const invalid_params: string[] = that.positionedParams.reduce((invalid_params, param_name) => {

                            //$FlowIgnore
                            const type = typeof params[param_name]
                            if (!(type === 'number' || type === 'string')) {
                                //$FlowIgnore
                                invalid_params.push(`${param_name}: ${type} = ${params[param_name]}`)
                            }

                            return invalid_params
                        }, [])

                        if (invalid_params.length > 0) {
                            throw Error(
                                'Params should have type Array<string | number>, but such params received: ' +
                                invalid_params.join(', ')
                            )
                        }
                    }
                }

                const
                    query_str = queryString.stringify(queryParams).toString(),
                    //$FlowIgnore
                    path: string [] = that.route.map((id) => id[0] === ':' ? params[id.slice(1)] : id)

                const
                    store = (getParent(that, 2): RouterStore),
                    root = pathToIds(store.rootPath)

                return addHeadSlash([...root, ...path].join('/') + (query_str ? '?' + query_str : ''))

            }
        }: { goTo: $PropertyType<Route, "goTo">, replaceUrlParams: $PropertyType<Route, "replaceUrlParams"> })
    })
    .props({
        name: types.identifier(types.string),
        path: types.string,
        component: types.frozen
    })

export default RouteModel
