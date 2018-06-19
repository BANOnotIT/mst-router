//@flow
import {inject, observer} from 'mobx-react'
import type {RouterStore} from '../mst-router-store'

const MobxRouter = ({app: {router}, children}: { children: any, app: { router: RouterStore } }) =>
    router.currentView ? router.currentView.component : children

export default inject('app')(observer(MobxRouter))
