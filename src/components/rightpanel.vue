<template>
<f7-panel right reveal layout="dark" @panel:open="refreshLastSync()">
    <f7-view id="right-panel-view" navbar-through :dynamic-navbar="true">
        <f7-navbar :title="title"></f7-navbar>
        <f7-pages>
            <f7-page>
                <p></p>
                <f7-list>
                    <f7-list-item link="/" title="Notes" link-view="#main-view" link-close-panel>
                        <material-icon name="folder"></material-icon>
                    </f7-list-item>
                    <f7-list-item link="/editor/" title="Write" link-view="#main-view" link-close-panel>
                        <material-icon name="edit"></material-icon>
                    </f7-list-item>
                </f7-list>
                <p></p>
                <f7-buttons v-if="!user">
                    <f7-button open-login-screen="#login-screen">Log In</f7-button>
                    <f7-button open-login-screen="#signup-screen">Sign Up</f7-button>
                </f7-buttons>
                <f7-list v-if="user">
                    <f7-list-item link="/account/" title="Account" link-view="#main-view" link-close-panel>
                        <material-icon name="account_circle"></material-icon>
                    </f7-list-item>
                    <f7-list-item>
                        <f7-button @click="logout()">Log out</f7-button>
                    </f7-list-item>
                </f7-list>
                <p></p>
                <!-- <f7-list>
                    <f7-list-item link="javascript:window.open('https://guides.github.com/pdfs/markdown-cheatsheet-online.pdf')" title="MD Cheat Sheet" link-view="#main-view" link-close-panel>
                        <material-icon name="help"></material-icon>
                    </f7-list-item>
                    <f7-list-item link="/about/" title="About" link-view="#main-view" link-close-panel>
                        <material-icon name="info"></material-icon>
                    </f7-list-item>
                </f7-list> -->
                <f7-block v-if="user">
                    <span class="lastSync">Last sync: <span class="lastSyncDate">{{lastSync}}</span></span>
                </f7-block>
            </f7-page>
        </f7-pages>
    </f7-view>
</f7-panel>
</template>

<script>
import firebase from '../bin/Cloud'

export default {
    name: 'right-panel',
    data () {
        return {
            'user': undefined,
            'lastSync': ''
        }
    },
    computed: {
        title () {
            return this.user ? (this.user.displayName || this.user.email) : ''
        }
    },
    mounted () {
        firebase.auth().onAuthStateChanged((user) => {
            this.user = user || undefined
        })
    },
    methods: {
        logout () {
            firebase.auth().signOut()
            .catch((error) => {
                console.error(error)
            })
        },
        refreshLastSync () {
            try {
                this.lastSync = window.localStorage.getItem('_lastSync') || ''
            } catch (error) {
                console.error(error)
            }
        }
    }
}
</script>
<style scoped>
    .lastSync {
        position: absolute;
        bottom: 2vh;
        margin-left: 44%;
        margin-right: -50%;
        transform: translateX(-50%);
    }
    .lastSyncDate{
        color: orange;
    }
</style>