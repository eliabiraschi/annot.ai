<template>
<f7-panel left reveal layout="dark" @panel:open="refresh()">
    <f7-view id="left-panel-view" navbar-through :dynamic-navbar="true">
        <f7-navbar title="Tags"></f7-navbar>
        <f7-pages>
            <f7-page>
                <f7-searchbar
                    cancel-link="Cancel"
                    placeholder="Filter"
                    :clear-button="false"
                    v-model="filterValue"
                ></f7-searchbar>
                <f7-list class="tagsList">
                    <f7-list-item v-for="tag in cTags" :title="tag" :link="'/home/' + tag" link-view="#main-view" link-close-panel :key="tag"></f7-list-item>
                </f7-list>
            </f7-page>
        </f7-pages>
    </f7-view>
</f7-panel>
</template>

<script>
import { DB, RemoteDB } from '../bin/Storage'
import firebase from '../bin/Cloud'
import _ from 'lodash'

export default {
    name: 'left-panel',
    data () {
        return {
            'tags': [],
            'cTags': [],
            'filterValue': ''
        }
    },
    watch: {
        filterValue: _.debounce(function () {
            this.cTags = this.tags.filter(tag => {
                if (tag.indexOf(this.filterValue.trim().toLowerCase()) !== -1) {
                    return true
                } else {
                    return false
                }
            })
        }, 500)
    },
    created () {
        firebase.auth().onAuthStateChanged((user) => {
            this.user = user || {}
            this.DB = user ? new RemoteDB(user.uid) : DB
            this.refresh()
        })
    },
    methods: {
        refresh () {
            this.filterValue = ''
            this.DB.getFullTagsList()
                .then(list => {
                    this.cTags = this.tags = list.sort()
                })
                .catch(error => {
                    console.error(error)
                })
        }
    }
}
</script>
<style scoped>
.tagsList {
    overflow-y: auto;
}
</style>