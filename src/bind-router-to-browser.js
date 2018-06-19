//@flow

import {autorun} from 'mobx'
import type {RouterStore} from './mst-router-store'


const bindBrowserHistory = (store: RouterStore) => {

    let oldPopState = window.onpopstate

    window.onpopstate = function () {
        store.goToUrl(currentLocation())
    }

    store.goToUrl(currentLocation())

    //autorun and watch for path changes
    let a = autorun(() => {
        const {currentPath} = store
        if (currentPath !== currentLocation()) {
            window.history.pushState(null, null, currentPath)
        }
    })

    return function () {
        a()
        window.onpopstate = oldPopState
    }
}
//
export default bindBrowserHistory

const currentLocation = () => window.location.href.slice(window.location.origin.length)
