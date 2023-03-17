# websocket封装

目的是为了更方便的使用websocket以及解决一个页面必须使用多个websocket链接并且难以管理的情况，封装后，使用new 方法创建一个新的ws类即可实现对该对象的控制，其中包括了自动重连机制，发送函数，收到消息处理等。思路是使用
``` js
window.dispatchEvent(new CustomEvent(XXX, {
    detail: {
        data: e.data
    }
}))
```
方法创建一个新的消息队列,并且在客户端使用window.addEventListener监听该自定义事件，并且在页面销毁时解除该事件绑定，同时关闭websocket链接。下面贴上源码...

***

/utils目录下新建create_socket.js  

create_socket.js
``` js
"use strict"
let getToken = function() {
	// 加密方法自行实现
	return xxx
}

class socketTask {
	/**
	 * @param {string} options 配置项{url: 连接地址，symbol:事件识别符，number: 重连次数：-表示无穷大，不设置默认5次}
	 */
	constructor(options) {
		this.url = options.url
		this.symbol = options.symbol
		this.reConnectNumber = options.number === undefined ? 5 : options.number
		this._Socket = null
		this._setIntervalWesocketPush = null
		this._reConnectCount = 0
		this._checkSocketHeart = false
		this._message = []
		this._closeSocketByUser = false
		this._reConnectInterval = null
		this._heartbeatCheck = true
	}
	/**
	 * 创建新websocket连接
	 */
	createSocket() {
		if ('WebSocket' in window) {
			if (this._Socket) {
				this._Socket.close()
				this._Socket = null
			}
			this._closeSocketByUser = false
			console.log('正在连接' + this.symbol)
			this._Socket = new WebSocket(this.url + '?token=' + getToken())
			this._Socket.onopen = this.onopenWS.bind(this)
			this._Socket.onmessage = this.onmessageWS.bind(this)
			this._Socket.onclose = this._oncloseWS.bind(this)
			this._Socket.onerror = this._onerrorWS.bind(this)
		} else {
			console.log('Not support websocket')
		}
	}
	/**
	 * 关闭websocket连接
	 */
	closeSocket() {
		if (this._setIntervalWesocketPush) {
			clearInterval(this._setIntervalWesocketPush)
			this._setIntervalWesocketPush = null
		}

		if (this._reConnectInterval) {
			clearInterval(this._reConnectInterval)
			this._reConnectInterval = null
		}

		this._closeSocketByUser = true

		if (this._Socket) {
			this._Socket.close()
			this._Socket = null
		}

		console.log(`-${this.symbol}已关闭-`)
	}
	/**打开WS之后发送心跳 */
	onopenWS() {
		console.log(`${this.symbol}已连接，当前ws状态为：${this._Socket.readyState}`)

		if (this._Socket && this._Socket.readyState === 1) {
			this._reConnectInterval && clearInterval(this._reConnectInterval)
			this._reConnectInterval = null
			this._reConnectCount = 0
		}

		this._heartbeatCheck = true
		this._sendPing()
		if (this._message.length) {
			this._message.forEach((value, index, arr) => {
				this.sendWSPush(value)
			})
			this._message.length = 0
		}
	}
	// 发生意外错误
	_onerrorWS(err) {
		console.log('发生了意外错误' + err)
		this._Socket && this._Socket.close()
		console.log(this._reConnectInterval)
		console.log(err)
		console.log(`${this.symbol}已断开连接,立即开始重连`)
		console.log(`目前的链接状态：${this._Socket.readyState}`)
		if (this._setIntervalWesocketPush) {
			clearInterval(this._setIntervalWesocketPush)
			this._setIntervalWesocketPush = null
		}
		// 由于已知错误发生的断开，则立即启动重连
		this._reConnectWs()
	}
	/**WS数据接收统一处理 */
	onmessageWS(e) {
		console.log(e)
		if (e.data === 'heartbeat') {
			// 收到心跳信息后更改heartbeat状态
			console.log('收到心跳信息，重置_heartbeatCheck状态为true')
			this._heartbeatCheck = true
			return
		}
		window.dispatchEvent(new CustomEvent(this.symbol, {
			detail: {
				data: e.data
			}
		}))
	}
	/**
	 * 发送数据
	 * @param {any} message 需要发送的数据
	 */
	sendWSPush(message) {
		if (this._Socket !== null && this._Socket.readyState === 3) {
			this.createSocket()
		} else if (this._Socket.readyState === 1) {
			this._Socket.send(JSON.stringify(message))
		}
	}
	/** 断开后 */
	_oncloseWS(err) {
		// 由于未知错误发生的断开，则由下次心跳计时器判断是否需要重连（为了避免err.code===1006时发生的无限重连BUG）
		console.error(err, `${err.code}错误导致关闭`)
		console.log(`${this.symbol}已关闭连接`)
	}
	/**发送心跳
	 * @param {number} time 心跳间隔毫秒 默认35000
	 * @param {string} ping 心跳名称 默认字符串ping
	 */
	_sendPing(time = 35000, ping = 'pong') {
		if (this._setIntervalWesocketPush) {
			return
		}
		this._setIntervalWesocketPush = setInterval(() => {
			console.log(`正在发送心跳${ping}`)
			this._heartbeatCheck = false
			this._Socket.send(ping)
			setTimeout(() => {
				if (this._heartbeatCheck === false) {
					console.log('距离上次请求心跳依旧没有返回，可能已经失联，清除心跳计时器，走重启流程')
					if (this._setIntervalWesocketPush) {
						clearInterval(this._setIntervalWesocketPush)
						this._setIntervalWesocketPush = null
					}
					this._reConnectWs()
				}
			}, 5 * 1000)
		}, time)
	}
	_reConnectWs() {
		console.log(this._reConnectInterval, '重连定时器')
		if (this._reConnectInterval || this.reConnectNumber === 0) return

		const reconnect = () => {
			if (this.reConnectNumber === '-' || this._reConnectCount < this.reConnectNumber) {
				this._reConnectCount++
				console.log(
					`${this.symbol}连接失败重连中...计数器：${this._reConnectCount}/${this.reConnectNumber}`)
				this.createSocket()
			} else {
				clearInterval(this._reConnectInterval)
				this._reConnectInterval = null
			}
		}

		reconnect()

		// 30秒重连一次，立即执行一次，如果reConnectNumber == '-' 表示无穷大，会一直重连
		this._reConnectInterval = setInterval(reconnect(), 30 * 1000)
	}
}

export {
	websocketTask
}
```


需要使用的组件index.vue中

``` js
import { websocketTask } from '@/utils/create_socket.js';
export default {
    data() {
        return {
            wsTask: null
        }
    },
    mounted() {
        // xxx为实际需要链接的ws服务器地址 ws:// 或者 wss://
        // symbol为监听的事件名称
        // createSocket为创建socket方法
        // closeSocket为关闭socket方法
        this.wsTask = new websocketTask({url: xxx,symbol: 'socketMessage',number: '-'})
        this.wsTask.createSocket()
        
        window.addEventListener('socketMessage', this.getsocketData)
    },
    destroyed() {
        this.wsTask.closeSocket()
        window.removeEventListener('socketMessage', this.getsocketData)
    },
    methods: {
        getsocketData(e) {
            try {
                const data = e && JSON.parse(e.detail.data)

                // xxxxxx
                // your code here
            } catch (e) {
                console.log(e, 'websocket推送失败')
            }
        },
    }
}
```
