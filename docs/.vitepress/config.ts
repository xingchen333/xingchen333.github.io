import { DefaultTheme, defineConfig } from "vitepress"
import algolia from './algolia'

const nav: DefaultTheme.NavItem[] = [
    { text: '指南', link: '/guide/' },
    {
        text: 'PHP',
        items: [
            { text: '暂定', link: '/php/' },
        ]
    },
    {
        text: 'VUE',
        items: [
            { text: 'websocket', link: '/vue/websocket/websocket' },
            { text: '自定义组件', link: '/vue/components/message-scroll' },
        ]
    },
    {
        text: 'PHP',
        items: [
            { text: '暂定', link: '/php/' },
        ]
    },
    {
        text: 'UNIAPP',
        items: [
            { text: '暂定', link: '/uniapp/' },
        ]
    },
    {
        text: 'NODE',
        items: [
            { text: '暂定', link: '/node/' },
        ]
    }, {
        text: 'JAVASCRIPT',
        items: [
            { text: '暂定', link: '/javascript/' },
        ]
    }, {
        text: '其他',
        items: [
            { text: '暂定', link: '/others/' },
        ]
    }
]

const sidebar: DefaultTheme.Sidebar = {
    '/guide': [
        {
            text: '指南',
            items: [
                { text: '博客介绍', link: '/guide/' }
            ]
        }
    ],
    '/php': [
        {
            text: '暂定',
            items: [
                { text: '暂定', link: '/php/' },
            ]
        }
    ],
    '/vue': [
        {
            text: '简介',
            link: '/vue/'
        },
        {
            text: 'websocket',
            items: [
                { text: 'websocket类封装', link: '/vue/websocket/websocket' },
            ]
        },
        {
            text: '自定义组件',
            items: [
                { text: '消息无缝滚动', link: '/vue/components/message-scroll' },
            ]
        },
        {
            text: 'webpack',
            items: [
                { text: 'plugins配置', link: '/vue/webpack/plugins' },
            ]
        }
    ],
    '/uniapp': [
        {
            text: '暂定',
            items: [
                { text: '暂定', link: '/uniapp/' },
            ]
        }
    ],
    '/node': [
        {
            text: '暂定',
            items: [
                { text: '暂定', link: '/node/' },
            ]
        }
    ],
    '/javascript': [
        {
            text: '暂定',
            items: [
                { text: '暂定', link: '/javascript/' },
            ]
        }
    ],
    '/others': [
        {
            text: '其他',
            items: [
                { text: '暂定', link: '/others/' },
            ]
        }
    ]
}

export default defineConfig({
    title: 'Ali`s blog',
    description: '基于Vite press的个人博客',
    outDir: '../dist',
    lang: 'cn-ZH',
    base: '/',
    lastUpdated: true,
    markdown: {
        lineNumbers: true
    },
    themeConfig: {
        logo: '/images/logo.png',
        siteTitle: 'AlexAli',
        outline: 3,
        socialLinks: [
            { icon: 'github', link: 'https://github.com/xingchen333' }
        ],
        nav,
        sidebar,
        algolia: algolia
    }
})