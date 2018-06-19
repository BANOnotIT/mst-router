/**
 * Created by BANO.notIT on 15.03.18
 */

import React from "react";
import "should";
import "should-sinon";

import {RouteModel, RouterStore} from "../index.js";
import {getSnapshot} from "mobx-state-tree";

describe("mobx-state-tree-router", () => {

    describe("@RouterStore", function () {

        it("should be creatable", () => {

            const router = RouterStore.create({
                routes: [
                    {
                        name: "test",
                        path: "/test/index",
                        component: <div/>
                    },
                    {
                        name: "test1",
                        path: "/test/",
                        component: "!! Component !!"
                    }
                ]
            });

            getSnapshot(router).should.eql({
                rootPath: "/",
                currentPath: "",
                routes: {
                    test: {
                        name: "test",
                        path: "/test/index",
                        component: <div/>
                    },
                    test1: {
                        name: "test1",
                        path: "/test/",
                        component: "!! Component !!",
                    }
                }
            });

        });

        it("should add new routes", () => {

            const router = RouterStore.create({});

            router.addRoute({name: "test", path: "/test/"});

            getSnapshot(router).should.eql({
                currentPath: "",
                rootPath: "/",
                routes: {
                    test: {
                        name: "test",
                        path: "/test/",
                        component: undefined,
                    }
                }
            });

        });

        it("+.leaf", () => {

            const component = "CoMpOnEnT";

            const router = RouterStore.create({
                routes: [
                    {name: "test1", path: "/test/1", component},
                    {name: "test2", path: "indexer/:test/12", component},
                    {name: "test3", path: "/:gid/:pid/trid", component}
                ]
            });


            router.leaf.should.match({
                test: {
                    [1]: {
                        "::TEST INDEX::": router.routes.get("test1")
                    }
                }
            });

            router.leaf.should.match({
                indexer: {
                    "::TEST VALUE::": {
                        [12]: {
                            "::TEST INDEX::": router.routes.get("test2")
                        }
                    }
                }
            });

            router.leaf.should.match({
                "::TEST VALUE::": {
                    "::TEST VALUE::": {
                        trid: {
                            "::TEST INDEX::": router.routes.get("test3")
                        }
                    }
                }
            });

        });

        describe("+.currentView", () => {

            let router;
            beforeEach(() => {
                router = RouterStore.create({
                    currentPath: "/",
                    routes: [
                        {
                            name: "initial",
                            path: "/",
                        },
                        {
                            name: "static",
                            path: "/test/static/path/",
                        },
                        {
                            name: "dynamic",
                            path: "/:dyn/dynamic",
                        },
                    ]
                });

            });

            it("should serve initialized path", () => {

                router.currentView.should.eql(router.routes.get("initial"));

            });

            it("should serve static paths", () => {

                router.goToUrl("/test/static/path");

                router.currentView.should.eql(router.routes.get("static"));

            });

            it("should serve dynamic paths", () => {

                router.goToUrl("/testing/dynamic");

                router.currentView.should.eql(router.routes.get("dynamic"));

            });

            it("should serve paths trailing slash freely", () => {

                router.goToUrl("/testing/dynamic/");

                router.currentView.should.eql(router.routes.get("dynamic"));


                router.goToUrl("/test/static/path/");

                router.currentView.should.eql(router.routes.get("static"));

            });

            it("should serve paths free from query params", () => {

                router.goToUrl("/testing/dynamic?test=1");

                router.currentView.should.eql(router.routes.get("dynamic"));


                router.goToUrl("/test/static/path?asdf=????fdsa");

                router.currentView.should.eql(router.routes.get("static"));

            });

            it("should return undefined if \"404\"", () => {
                router.goToUrl("/undefined/path/at/all");

                ({view: router.currentView}).should.eql({view: undefined});
            });

            it("should serve paths with root", () => {

                const router = RouterStore.create({
                    rootPath: "/root",
                    currentPath: "/root",
                    routes: [
                        {
                            name: "initial",
                            path: "/",
                        },
                        {
                            name: "static",
                            path: "/test/static/path/",
                        },
                        {
                            name: "dynamic",
                            path: "/:dyn/dynamic",
                        },
                    ]
                });

                router.currentView.should.eql(router.routes.get("initial"));

                router.goToUrl("/root/test/static/path/");
                router.currentView.should.eql(router.routes.get("static"));

                router.goToUrl("/root/testering/dynamic/");
                router.currentView.should.eql(router.routes.get("dynamic"));

            });

        });

        describe(".goToUrl()", () => {

            it("should change url", () => {
                let
                    router = RouterStore.create({
                        currentPath: "/test",
                        routes: [
                            {
                                name: "test",
                                path: "/:gid/index",
                                component: <div/>,
                            },
                            {
                                name: "test1",
                                path: "/test/",
                                component: "!! Component !!",
                            }
                        ]
                    });

                router.goToUrl("");
                router.currentPath.should.eql("");

            });

        });

        describe(".goTo()", () => {

            it("should receive view", () => {
                let
                    router = RouterStore.create({
                        currentPath: "/test",
                        routes: [
                            {
                                name: "test",
                                path: "/:gid/index",
                                component: <div/>,
                            },
                            {
                                name: "test1",
                                path: "/test/",
                                component: "!! Component !!",
                            }
                        ]
                    });

                router.goTo(router.routes.get("test"), {gid: 1});
                router.currentPath.should.eql("/1/index");
            });
            it("should receive name of view", () => {
                let
                    router = RouterStore.create({
                        currentPath: "/test",
                        routes: [
                            {
                                name: "test",
                                path: "/:gid/index",
                                component: <div/>,
                            },
                            {
                                name: "test1",
                                path: "/test/",
                                component: "!! Component !!",
                            }
                        ]
                    });

                router.goTo("test", {gid: 1});
                router.currentPath.should.eql("/1/index");
            });
        });

        describe("+.params", () => {

            let router;

            beforeEach(() => {
                router = RouterStore.create({
                    currentPath: "/test/initial/params/",
                    routes: [
                        {
                            name: "initial",
                            path: "/:first/initial/:second"
                        },
                        {
                            name: "test1",
                            path: ":first/:second/:third"
                        }
                    ]
                });
            });

            it("should return params on initial", () => {
                router.params.should.eql({
                    first: "test",
                    second: "params",
                });
            });

            it("should return params on dynamic path", () => {
                router.goToUrl("test/our/params");
                router.params.should.eql({
                    first: "test",
                    second: "our",
                    third: "params",
                });
            });

            it("should return no params on undefined path", () => {
                router.goToUrl("undefined/path");
                router.params.should.eql({});
            });

        });

        describe("+.queryParams", () => {

            let router;
            beforeEach(() => {
                router = RouterStore.create({
                    currentPath: "/?initialParam=1",
                    routes: [
                        {
                            name: "init",
                            path: "/"
                        }
                    ]
                });
            });


            it("should return queryParams from initial path", () => {
                router.queryParams.initialParam.should.eql("1");
            });
            it("should return queryParams from other paths", () => {

                router.goToUrl("?testValue=1&testValue=2");
                router.queryParams.testValue.should.eql(["1", "2"]);

            });


        });

    });

    describe("@Route", () => {

        it("should be creatable", () => {

            const component = <a/>;

            const route = RouteModel.create({name: "test", path: "/test/", component});

            getSnapshot(route).should.eql({
                path: "/test/",
                name: "test",
                component,
            });

        });

        it("+.id", () => {
            RouteModel.create({name: "test", path: "/test/"}).id.should.eql("test");
            RouteModel.create({name: "test", path: "test/"}).id.should.eql("test");
            RouteModel.create({name: "test", path: "/test"}).id.should.eql("test");
            RouteModel.create({name: "test", path: "test"}).id.should.eql("test");
            RouteModel.create({name: "test", path: "test/test"}).id.should.eql("test/test");
            RouteModel.create({name: "test", path: "/test/test/"}).id.should.eql("test/test");
            RouteModel.create({name: "test", path: "/test/:id/test/"}).id.should.eql("test//test");
            RouteModel.create({name: "test", path: "/:id/test/:id/test/"}).id.should.eql("/test//test");
            RouteModel.create({name: "test", path: "/test/:id/:id/test/"}).id.should.eql("test///test");
            RouteModel.create({name: "test", path: "/test/test/"}).id.should.eql("test/test");
        });

        it("+.route", () => {
            RouteModel.create({name: "teste", path: "/"}).route.should.eql([]);
            RouteModel.create({name: "teste", path: "//"}).route.should.eql([]);
            RouteModel.create({name: "teste", path: "/test/"}).route.should.eql(["test"]);
            RouteModel.create({name: "teste", path: "test/"}).route.should.eql(["test"]);
            RouteModel.create({name: "teste", path: "/test"}).route.should.eql(["test"]);
            RouteModel.create({name: "teste", path: "test"}).route.should.eql(["test"]);
            RouteModel.create({name: "teste", path: "test/test"}).route.should.eql(["test", "test"]);
            RouteModel.create({name: "teste", path: "/test/test/"}).route.should.eql(["test", "test"]);
            RouteModel.create({name: "teste", path: "/test/:id/test/"}).route.should.eql(["test", ":id", "test"]);
            RouteModel.create({
                name: "teste",
                path: "/:id/test/:id/test/"
            }).route.should.eql([":id", "test", ":id", "test"]);
            RouteModel.create({
                name: "teste",
                path: "/test/:id/:id/test/"
            }).route.should.eql(["test", ":id", ":id", "test"]);
        });

        it("+.positionedParams", () => {
            RouteModel.create({name: "test", path: "/test/"}).positionedParams.should.eql([]);
            RouteModel.create({name: "test", path: "test/"}).positionedParams.should.eql([]);
            RouteModel.create({name: "test", path: "/test"}).positionedParams.should.eql([]);
            RouteModel.create({name: "test", path: "test"}).positionedParams.should.eql([]);
            RouteModel.create({name: "test", path: "test/test"}).positionedParams.should.eql([]);
            RouteModel.create({name: "test", path: "/test/test/"}).positionedParams.should.eql([]);
            RouteModel.create({name: "test", path: "/test/:id/test/"}).positionedParams.should.eql(["id"]);
            RouteModel.create({name: "test", path: "/:id/test/:id/test/"}).positionedParams.should.eql(["id", "id"]);
            RouteModel.create({name: "test", path: "/test/:id/:id/test/"}).positionedParams.should.eql(["id", "id"]);
        });

        describe(".replaceUrlParams()", () => {
            it("should throw error when params are not good", () => {

                const component = "Component";

                const
                    route = RouteModel.create({name: "test", path: "/:id/test/:focus/", component});

                (() => route.replaceUrlParams({id: 1})).should
                    .throwError(
                        "Params should have type Array<string | number>," +
                        " but such params received: focus: undefined = undefined"
                    );

                (() => route.replaceUrlParams({})).should
                    .throwError(
                        "Params should have type Array<string | number>," +
                        " but such params received: id: undefined = undefined, focus: undefined = undefined"
                    );
                (() => route.replaceUrlParams({id: []})).should
                    .throwError(
                        "Params should have type Array<string | number>," +
                        " but such params received: id: object = , focus: undefined = undefined"
                    );
                (() => route.replaceUrlParams({id: new Error})).should
                    .throwError(
                        "Params should have type Array<string | number>," +
                        " but such params received: id: object = Error, focus: undefined = undefined"
                    );
                (() => route.replaceUrlParams({})).should
                    .throwError(
                        "Params should have type Array<string | number>," +
                        " but such params received: id: undefined = undefined, focus: undefined = undefined"
                    );

            });

            it("should return url from static", () => {
                let
                    router = RouterStore.create({
                        currentPath: "/test",
                        routes: [
                            {
                                name: "test",
                                path: "/:gid/index",
                                component: <div/>,
                            },
                            {
                                name: "test1",
                                path: "/test/",
                                component: "!! Component !!",
                            }
                        ]
                    });

                router.routes.get("test1").replaceUrlParams().should.eql("/test");

            });
        });

    });

});

