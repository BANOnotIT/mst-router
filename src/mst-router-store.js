//@flow
// noinspection ES6CheckImport
import type {Params, Route} from './route'
import RouteModel from './route'
import {types} from 'mobx-state-tree'
import {pathToIds} from './utils'
import queryString from 'query-string'

const
    Index = process.env.NODE_ENV === 'test' ? '::TEST INDEX::' : Symbol('Index Leaf'),
    Val = process.env.NODE_ENV === 'test' ? '::TEST VALUE::' : Symbol('Value Leaf')


type Leaf = {
    Index?: Route,
    Val?: Route,
    [key: string]: Leaf,
}

export type RouterStore = RouterStatic & RouterMethods & RouterViews

type RouterViews = {
    +params: { [key: string]: string };
    +queryParams: { [key: string]: string };
    +leaf: Leaf;
    +currentView: Route | void;

    +_rootFreeIds: string[] | void;
}

type RouterStatic = {

    currentPath: string;
    rootPath: string;

    routes: ObMap<Route>;

}

interface RouterMethods {

    goTo(Route | string, params?: Params, queryParams?: { [key: string]: any }): void;

    addRoute(Route): void;

    goToUrl(string): void;
}


const RouterStoreModel = types
    .model('Router', {
        currentPath: types.optional(types.string, ''),
        rootPath: types.optional(types.string, '/'),
        routes: types.optional(types.map(RouteModel), {}),
    })
    .preProcessSnapshot((snap) => {

        if (snap && snap.hasOwnProperty('routes') && Array.isArray(snap.routes)) {
            const rts = snap.routes.slice()
            snap.routes = {}

            rts.forEach((rt) =>
                snap.routes[rt.name] = rt
            )
        }

        return snap

    })
    .views((that: RouterStore) => ({
        get leaf() {

            let leaf = {}

            that.routes.values().forEach((view) => {
                //$FlowIgnore
                view.route
                    .reduce((root, val) => {
                        //$FlowIgnore
                        if (val[0] === ':') {
                            val = Val
                        }

                        //$FlowIgnore
                        if (root[val] === undefined) {
                            //$FlowIgnore
                            root[val] = {}
                        }
                        //$FlowIgnore
                        return root[val]

                    }, leaf)[Index] = view
            })

            return leaf
        },

        get _rootFreeIds() {
            const
                pathIds = pathToIds(that.currentPath),
                rootIds = pathToIds(that.rootPath)

            if (rootIds.some((a, i) => pathIds[i] !== a)) {
                return undefined
            } else {
                return pathIds.slice(rootIds.length)
            }

        },

        get currentView() {

            if (that._rootFreeIds === undefined) {
                return undefined
            } else {
                return getViewFromLeafsAndPath(that.leaf, that._rootFreeIds)
            }

        },

        get params() {

            if (that.currentView === undefined) {
                return {}
            }

            let result = {}

            that.currentView.route.forEach((id, index) => {
                if (id[0] === ':') {
                    //$FlowIgnore
                    result[id.slice(1)] = that._rootFreeIds[index]
                }
            })

            return result

        },

        get queryParams() {

            const queryParams = that.currentPath.split('?').slice(1).join('?')

            return queryString.parse(queryParams)
        }

    }: RouterViews))

    .actions((that: RouterStore) => ({
        addRoute(route) {

            that.routes.put(route)

        },

        goTo(route, params, queryParams) {

            if (typeof route === 'string') {
                route = that.routes.get(route)
            }

            if (!route) {
                throw new Error('No route passed')
            }

            that.goToUrl(route.replaceUrlParams(params, queryParams))

        },

        goToUrl(nextUrl) {

            that.currentPath = nextUrl

        }
    }: RouterMethods))

export default RouterStoreModel


function getViewFromLeafsAndPath(leaf: Leaf, ids: string[]): Route | void {

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]


        if (leaf.hasOwnProperty(id)) {
            leaf = leaf[id]

        } else
        //$FlowIgnore
        if (leaf[Val] !== undefined) {
            leaf = leaf[Val]

        } else {
            return
        }
    }

    //$FlowIgnore
    return leaf[Index]

}


