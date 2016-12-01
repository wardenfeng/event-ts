var me;
(function (me) {
    var feng3d;
    (function (feng3d) {
        /**
         * 事件
         * @author warden_feng 2014-5-7
         */
        var Event = (function () {
            /**
             * 创建一个作为参数传递给事件侦听器的 Event 对象。
             * @param type 事件的类型，可以作为 Event.type 访问。
             * @param data 携带数据
             * @param bubbles 确定 Event 对象是否参与事件流的冒泡阶段。默认值为 false。
             */
            function Event(type, data, bubbles) {
                if (data === void 0) { data = null; }
                if (bubbles === void 0) { bubbles = false; }
                this._type = type;
                this._bubbles = bubbles;
                this.data = data;
            }
            Object.defineProperty(Event.prototype, "isStop", {
                /**
                 * 是否停止处理事件监听器
                 */
                get: function () {
                    return this._isStop;
                },
                set: function (value) {
                    this._isStopBubbles = this._isStop = this._isStopBubbles || value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Event.prototype, "isStopBubbles", {
                /**
                 * 是否停止冒泡
                 */
                get: function () {
                    return this._isStopBubbles;
                },
                set: function (value) {
                    this._isStopBubbles = this._isStopBubbles || value;
                },
                enumerable: true,
                configurable: true
            });
            Event.prototype.tostring = function () {
                return "[" + (typeof this) + " type=\"" + this._type + "\" bubbles=" + this._bubbles + "]";
            };
            Object.defineProperty(Event.prototype, "bubbles", {
                /**
                 * 表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
                 */
                get: function () {
                    return this._bubbles;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Event.prototype, "type", {
                /**
                 * 事件的类型。类型区分大小写。
                 */
                get: function () {
                    return this._type;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Event.prototype, "target", {
                /**
                 * 事件目标。
                 */
                get: function () {
                    return this._target;
                },
                set: function (value) {
                    this._currentTarget = value;
                    if (this._target == null) {
                        this._target = value;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Event.prototype, "currentTarget", {
                /**
                 * 当前正在使用某个事件侦听器处理 Event 对象的对象。
                 */
                get: function () {
                    return this._currentTarget;
                },
                enumerable: true,
                configurable: true
            });
            return Event;
        }());
        feng3d.Event = Event;
    })(feng3d = me.feng3d || (me.feng3d = {}));
})(me || (me = {}));
var me;
(function (me) {
    var feng3d;
    (function (feng3d) {
        /**
         * 为了实现非flash原生显示列表的冒泡事件，自定义事件适配器
         * @author feng 2016-3-22
         */
        var EventDispatcher = (function () {
            /**
             * 构建事件适配器
             * @param target		事件适配主体
             */
            function EventDispatcher(target) {
                if (target === void 0) { target = null; }
                /**
                 * 冒泡属性名称为“parent”
                 */
                this.bubbleAttribute = "parent";
                this.target = target;
                if (this.target == null)
                    this.target = this;
            }
            /**
             * 使用 EventDispatcher 对象注册事件侦听器对象，以使侦听器能够接收事件通知。
             * @param type						事件的类型。
             * @param listener					处理事件的侦听器函数。
             * @param thisObject                listener函数作用域
             * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
             */
            EventDispatcher.prototype.addEventListener = function (type, listener, thisObject, priority) {
                if (priority === void 0) { priority = 0; }
                if (listener == null)
                    return;
                $listernerCenter //
                    .remove(this.target, type, listener, thisObject) //
                    .add(this.target, type, listener, thisObject, priority);
            };
            /**
             * 从 EventDispatcher 对象中删除侦听器. 如果没有向 IEventDispatcher 对象注册任何匹配的侦听器，则对此方法的调用没有任何效果。
             *
             * @param type						事件的类型。
             * @param listener					要删除的侦听器对象。
             * @param thisObject                listener函数作用域
             */
            EventDispatcher.prototype.removeEventListener = function (type, listener, thisObject) {
                $listernerCenter //
                    .remove(this.target, type, listener, thisObject);
            };
            /**
             * 将事件调度到事件流中. 事件目标是对其调用 dispatchEvent() 方法的 IEventDispatcher 对象。
             * @param event						调度到事件流中的 Event 对象。
             */
            EventDispatcher.prototype.dispatchEvent = function (event) {
                //设置目标
                event.target = this.target;
                var listeners = $listernerCenter.getListeners(this.target, event.type);
                //遍历调用事件回调函数
                for (var i = 0; !!listeners && i < listeners.length && !event.isStop; i++) {
                    var element = listeners[i];
                    element.listener.call(element.thisObject, event);
                }
                //事件冒泡(冒泡阶段)
                if (event.bubbles && !event.isStopBubbles) {
                    this.dispatchBubbleEvent(event);
                }
            };
            /**
             * 检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器.
             *
             * @param type		事件的类型。
             * @return 			如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
             */
            EventDispatcher.prototype.hasEventListener = function (type) {
                var has = $listernerCenter.hasEventListener(this.target, type);
                return has;
            };
            /**
             * 销毁
             */
            EventDispatcher.prototype.destroy = function () {
                $listernerCenter.destroyDispatcherListener(this.target);
            };
            /**
             * 派发冒泡事件
             * @param event						调度到事件流中的 Event 对象。
             */
            EventDispatcher.prototype.dispatchBubbleEvent = function (event) {
                var bubbleTargets = this.getBubbleTargets(event);
                bubbleTargets && bubbleTargets.forEach(function (element) {
                    element && element.dispatchEvent(event);
                });
            };
            /**
             * 获取冒泡对象
             * @param event						调度到事件流中的 Event 对象。
             */
            EventDispatcher.prototype.getBubbleTargets = function (event) {
                return [this.target[this.bubbleAttribute]];
            };
            return EventDispatcher;
        }());
        feng3d.EventDispatcher = EventDispatcher;
        /**
         * 监听数据
         */
        var ListenerVO = (function () {
            function ListenerVO() {
            }
            return ListenerVO;
        }());
        /**
         * 事件监听中心
         */
        var ListenerCenter = (function () {
            function ListenerCenter() {
                /**
                 * 派发器与监听器字典
                 */
                this.map = [];
            }
            /**
             * 添加监听
             * @param dispatcher 派发器
             * @param type						事件的类型。
             * @param listener					处理事件的侦听器函数。
             * @param thisObject                listener函数作用域
             * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
             */
            ListenerCenter.prototype.add = function (dispatcher, type, listener, thisObject, priority) {
                if (thisObject === void 0) { thisObject = null; }
                if (priority === void 0) { priority = 0; }
                var dispatcherListener = this.getDispatcherListener(dispatcher);
                if (dispatcherListener == null) {
                    dispatcherListener = this.createDispatcherListener(dispatcher);
                }
                var listeners = dispatcherListener.get(type) || [];
                this.remove(dispatcher, type, listener, thisObject);
                for (var i = 0; i < listeners.length; i++) {
                    var element = listeners[i];
                    if (priority > element.priority) {
                        break;
                    }
                }
                listeners.splice(i, 0, { listener: listener, thisObject: thisObject, priority: priority });
                dispatcherListener.push(type, listeners);
                return this;
            };
            /**
             * 移除监听
             * @param dispatcher 派发器
             * @param type						事件的类型。
             * @param listener					要删除的侦听器对象。
             * @param thisObject                listener函数作用域
             */
            ListenerCenter.prototype.remove = function (dispatcher, type, listener, thisObject) {
                if (thisObject === void 0) { thisObject = null; }
                var dispatcherListener = this.getDispatcherListener(dispatcher);
                if (dispatcherListener == null) {
                    return this;
                }
                var listeners = dispatcherListener.get(type);
                if (listeners == null) {
                    return this;
                }
                for (var i = listeners.length - 1; i >= 0; i--) {
                    var element = listeners[i];
                    if (element.listener == listener && element.thisObject == thisObject) {
                        listeners.splice(i, 1);
                    }
                }
                if (listeners.length == 0) {
                    dispatcherListener.delete(type);
                }
                if (dispatcherListener.isEmpty()) {
                    this.destroyDispatcherListener(dispatcher);
                }
                return this;
            };
            /**
             * 获取某类型事件的监听列表
             * @param dispatcher 派发器
             * @param type  事件类型
             */
            ListenerCenter.prototype.getListeners = function (dispatcher, type) {
                var dispatcherListener = this.getDispatcherListener(dispatcher);
                if (dispatcherListener == null) {
                    return null;
                }
                return dispatcherListener.get(type);
            };
            /**
             * 判断是否有监听事件
             * @param dispatcher 派发器
             * @param type  事件类型
             */
            ListenerCenter.prototype.hasEventListener = function (dispatcher, type) {
                var dispatcherListener = this.getDispatcherListener(dispatcher);
                if (dispatcherListener == null) {
                    return false;
                }
                return !!dispatcherListener.get(type);
            };
            /**
             * 创建派发器监听
             * @param dispatcher 派发器
             */
            ListenerCenter.prototype.createDispatcherListener = function (dispatcher) {
                var dispatcherListener = new Map();
                this.map.push({ dispatcher: dispatcher, listener: dispatcherListener });
                return dispatcherListener;
            };
            /**
             * 销毁派发器监听
             * @param dispatcher 派发器
             */
            ListenerCenter.prototype.destroyDispatcherListener = function (dispatcher) {
                for (var i = 0; i < this.map.length; i++) {
                    var element = this.map[i];
                    if (element.dispatcher == dispatcher) {
                        element.dispatcher = null;
                        element.listener.destroy();
                        element.listener = null;
                        this.map.splice(i, 1);
                        break;
                    }
                }
            };
            /**
             * 获取派发器监听
             * @param dispatcher 派发器
             */
            ListenerCenter.prototype.getDispatcherListener = function (dispatcher) {
                var dispatcherListener = null;
                this.map.forEach(function (element) {
                    if (element.dispatcher == dispatcher)
                        dispatcherListener = element.listener;
                });
                return dispatcherListener;
            };
            return ListenerCenter;
        }());
        /**
         * 映射
         */
        var Map = (function () {
            function Map() {
                /**
                 * 映射对象
                 */
                this.map = {};
            }
            /**
             * 添加对象到字典
             * @param key       键
             * @param value     值
             */
            Map.prototype.push = function (key, value) {
                this.map[key] = value;
            };
            /**
             * 删除
             * @param key       键
             */
            Map.prototype.delete = function (key) {
                delete this.map[key];
            };
            /**
             * 获取值
             * @param key       键
             */
            Map.prototype.get = function (key) {
                return this.map[key];
            };
            /**
             * 是否为空
             */
            Map.prototype.isEmpty = function () {
                return Object.keys(this.map).length == 0;
            };
            /**
             * 销毁
             */
            Map.prototype.destroy = function () {
                var keys = Object.keys(this.map);
                for (var i = 0; i < keys.length; i++) {
                    var element = keys[i];
                    delete this.map[element];
                }
                this.map = null;
            };
            return Map;
        }());
        /**
         * 事件监听中心
         */
        var $listernerCenter = new ListenerCenter();
    })(feng3d = me.feng3d || (me.feng3d = {}));
})(me || (me = {}));
//# sourceMappingURL=event.js.map