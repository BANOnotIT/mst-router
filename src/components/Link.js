//@flow

import React from 'react'
import {inject, observer} from 'mobx-react'
import type {Route} from '../route'
import type {RouterStore} from '../mst-router-store'


type Props = {
    view: Route | string,
    queryParams?: {},
    refresh?: boolean,
    style?: { [string]: string },
    children?: React$Node<*>,
    mst_router: RouterStore,
    params?: {},
}

const Link = ({view, params = {}, queryParams = {}, refresh = false, children, mst_router, ...props}: Props) => {

    const view_: ?Route = typeof view === 'string' ? mst_router.routes.get(view) : view
    if (!view_) {
        return <span>Invalid name of view: {view}</span>
    }


    return <a
        onClick={e => {
            const middleClick = e.which === 2
            const cmdOrCtrl = (e.metaKey || e.ctrlKey)
            const openinNewTab = middleClick || cmdOrCtrl

            const shouldNavigateManually = refresh || openinNewTab || cmdOrCtrl

            if (!shouldNavigateManually) {
                e.preventDefault()
                view_.goTo(params, queryParams)
            }
        }}
        href={view_.replaceUrlParams(params, queryParams)}

        {...props}
    >
        {children}
    </a>
}


export default inject('mst_router')(observer(Link))
