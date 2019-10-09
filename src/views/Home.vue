<template>
    <f7-page name="home" @page:back="refresh()" class="homePageContent">
        <f7-navbar>
            <f7-nav-left>
                <f7-link open-panel="left">
                    <material-icon name="label_outline"></material-icon>
                </f7-link>
            </f7-nav-left>
            <f7-nav-center sliding>{{cTitle}}</f7-nav-center>
            <f7-nav-right>
                <i v-if="cTitle === 'My Notes'" class="material-icons pointer" @click="refresh()">refresh</i>
                <i v-if="cTitle !== 'My Notes'" class="material-icons pointer" @click="refresh()">clear</i>
                <f7-link icon="icon-bars" open-panel="right"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <f7-searchbar
            cancel-link="Cancel"
            placeholder="Search"
            :clear-button="false"
            v-model="searchValue"
        ></f7-searchbar>
        <!-- <f7-block class="orderInfo">
            <span>by <u @click="sort(cNotes, 'tags')">{{orderedBy}}</u></span>
        </f7-block> -->
        <f7-block v-if="cNotes.length" class="notes-list">
            <f7-card v-for="note in cNotes" class="noteCard">
                <f7-card-header>
                    <div class="upperButton">
                        <a class="pointer" @click="toggleTags()"><material-icon name="label"></material-icon></a>
                    </div>
                    <span class="noteTitle pointer" @click="open(note)">{{capitalize(note.tags[0])}}</span>
                    <div class="upperButton">
                        <a class="pointer" @click="open(note)"><material-icon name="edit"></material-icon></a>
                    </div>
                </f7-card-header>
                <f7-card-content>
                    <p v-if="contentVStags" class="pointer noteContent" @click="open(note)">{{note.text.substring(0,200)}}</p>
                    <p v-if="!contentVStags" class="tagsContent">
                        <f7-chip class="pointer" v-for="tag in note.tags" :text="tag" @click="refresh(tag)"></f7-chip>
                    </p>
                </f7-card-content>
                <f7-card-footer>
                <div class="noteDates">
                    <!-- <span class="createdLabel pointer" @click="sort(cNotes, 'created')"><strong>Created:</strong> {{note.created | formatDate}}</span>
                    <span class="lastEditLabel pointer" v-if="note.lastEdit" @click="sort(cNotes, 'lastEdit')"><strong>Last Edit:</strong> {{note.lastEdit | formatDate}}</span> -->
                    <span class="createdLabel"><strong>Created:</strong> {{note.created | formatDate}}</span>
                    <span class="lastEditLabel" v-if="note.lastEdit"><strong>Last Edit:</strong> {{note.lastEdit | formatDate}}</span>
                </div>
                <div class="lowerButtons">
                    <a class="pointer" @click="deleteNote(note.id)"><material-icon name="delete"></material-icon></a>
                    <a class="pointer" @click="alert('It is not possible to publish notes yet :(')"><material-icon name="publish"></material-icon></a>
                </div>
                </f7-card-footer>
            </f7-card>
        </f7-block>
        <f7-block v-if="!cNotes.length" class="noNotes">
            <img class="logo" src="static/logo.1024.png">
            <h2>You have no notes</h2>
        </f7-block>
        <f7-block class="floatingbutton">
            <f7-fab color="organge" @click="open()">
                <material-icon name="edit" size="29"></material-icon>
            </f7-fab>
        </f7-block>
    </f7-page>
</template>

<script>
import { DB, Draft, RemoteDB } from '../bin/Storage'
import _ from 'lodash'
import firebase from '../bin/Cloud'
import { parseLinks } from '../bin/Parser'

export default {
    name: 'home-view',
    data () {
        return {
            'notes': null,
            'cNotes': [],
            'searchValue': '',
            'filterValue': undefined,
            'orderedBy': '',
            'contentVStags': true,
            'user': {}
        }
    },
    computed: {
        cTitle () {
            const part1 = this.filterValue ? 'Tag: ' + this.capitalize(this.filterValue) : undefined
            const part2 = this.searchValue ? 'Search: ' + this.searchValue : undefined
            return (!part1 && !part2) ? 'My Notes' : (part1 && part2) ? (part1 + ' + ' + part2) : (part1 || '' + part2 || '')
        }
    },
    created () {
        firebase.auth().onAuthStateChanged((user) => {
            this.user = user || {}
            this.DB = user ? new RemoteDB(user.uid) : DB
            this.refresh(this.$route.params.filter || undefined)
        })
    },
    watch: {
        searchValue: _.debounce(function () {
            if (this.searchValue && this.searchValue.length > 0) {
                this.cNotes = this.notes
                    .filter(note => this.searchValue
                        .toLowerCase()
                        .trim()
                        .split(' ')
                        .some(current => note.text
                            .toLowerCase()
                            .indexOf(' ' + current.trim() + ' ') > -1))
            } else {
                this.refresh()
            }
        }, 500)
    },
    methods: {
        alert (message) {
            window.alert(message)
        },
        sortAndAssign (values, field) {
            this.notes = this.sort(values, field)
        },
        sort (values = this.cNotes, field) {
            const labels = {
                'created': 'creation date',
                'lastEdit': 'last edit',
                'tags': 'name'
            }
            this.orderedBy = labels[field]
            this.cNotes = values.sort((a, b) => {
                const A = Array.isArray(a[field]) ? (a[field][0].charCodeAt(0) * -1) : a[field]
                const B = Array.isArray(b[field]) ? (b[field][0].charCodeAt(0) * -1) : b[field]
                return B - A
            })
            return this.cNotes
        },
        capitalize (value) {
            return _.capitalize(value)
        },
        deleteNote (id) {
            this.DB.deleteNote(id)
                .then(() => {
                    this.$f7.addNotification({
                        message: `Note deleted`,
                        hold: 8000,
                        button: {
                            text: 'Ok',
                            color: 'orange'
                        }
                    })
                    this.refresh()
                })
                .catch(error => {
                    console.error(error)
                })
        },
        open (note = null) {
            if (note) {
                delete note.__ob__
                Draft.setCurrentEdit(note, true)
            }
            this.$router.load({url: '/editor/'})
        },
        refresh (filter) {
            if (filter) {
                this.filterValue = filter
                this.DB.findByTag(filter)
                    .then(results => this.sortAndAssign(results, 'created'))
                    .catch(error => {
                        console.error(error)
                    })
            } else {
                this.filterValue = undefined
                this.searchValue = undefined
                this.DB.getAll({})
                    .then(results => this.sortAndAssign(results, 'created'))
                    .catch(error => {
                        console.error(error)
                    })
            }
        },
        toggleTags () {
            this.contentVStags = !this.contentVStags
        },
        parseHTML (source) {
            return parseLinks(source)
        }
    }
}
</script>
<style scoped>
    .homePageContent {
        background-color: white;
    }
    .upperButton {
        display: block;
    }
    .upperButton > a {
        /* color: #293133; */
        color: orange;
    }
    .orderInfo {
        margin-top: 10px;
        margin-bottom: 10px;
        text-align: right;
        color: gray;
    }
    .card-footer {
        background-color: lightgrey;
    }
    .noteTitle {
        display: block;
        text-align: center;
        font-weight: bold;
        color: #293133;
        text-decoration: underline;
        text-decoration-style: double;
        text-decoration-color: orange;
    }
    .noNotes {
        text-align: center;
    }
    .logo {
        width: 15vw;
        padding-top: 15vh;
    }
    .noNotes > h2 {
        color: #293133;
    }
    .noteCard {
        background-color: white;
    }
    .noteContent {
        color: #293133;
        word-wrap: break-word;
    }
    .tagsContent {
    }
    .chip {
        color: #293133;
        margin: 1 1;
    }
    .createdLabel {
        display: block;
    }
    .lastEditLabel {
        display: block;
    }
    .noteDates {
        display: inline-block;
        width: 60%;
        font-style: italic;
        font-size: 12px;
    }
    .lowerButtons {
        display: block;
    }
    .lowerButtons > a {
        margin-left: 3vh;
        color: #293133;
    }
    strong {
        color: #293133;
    }
    .floating-button {
        position: fixed;
    }
</style>