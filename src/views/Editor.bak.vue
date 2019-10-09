<template>
    <f7-page name="editor">
        <f7-navbar id="noteTitle" :title="capitalize(navTitle)" back-link="Back" sliding data-ignore-cache="true" data-force="true">
            <f7-nav-right>
                <!-- <f7-link icon="icon-bars" open-panel="right"></f7-link> -->
                <a @click="clickOnCancel()" class="top-buttons pointer">
                    <material-icon name="insert_drive_file" size="34"></material-icon>
                </a>
                <a @click="clickOnSave()" class="top-buttons pointer">
                    <material-icon name="save" size="34"></material-icon>
                </a>
                <a @click="clickOnPreview()" class="top-buttons pointer">
                    <material-icon v-show="edit" name="visibility" size="34"></material-icon>
                    <material-icon v-show="preview" name="visibility_off" size="34"></material-icon>
                </a>
            </f7-nav-right>
        </f7-navbar>
        <div class="editor-container">
            <textarea 
                id="mainInput"
                v-if="edit"
                v-model="note.text"
                class="mainInput"
                @keyup="autosave()"
                @contextmenu="openMenu"
                @select="getSelection()"
                @click="closeMenu()">
            </textarea>
            <div id="preview" v-if="preview" v-html="parseHTML(note.html)"></div>
        </div>
        <f7-toolbar bottom id="bottomToolbar">            
            <f7-link @click="addFormatting('title')">
                <material-icon name="title"></material-icon>
            </f7-link>
            <f7-link @click="addFormatting('bold')">
                <material-icon name="format_bold"></material-icon>
            </f7-link>
            <f7-link @click="addFormatting('italic')">
                <material-icon name="format_italic"></material-icon>
            </f7-link>
            <f7-link @click="addFormatting('strikethrough')">
                <material-icon name="format_strikethrough"></material-icon>
            </f7-link>
            <f7-link @click="addFormatting('codeBlock')">
                <material-icon name="developer_mode"></material-icon>
            </f7-link>
            <f7-link @click="addFormatting('quoteBlock')">
                <material-icon name="format_quote"></material-icon>
            </f7-link>
            <f7-link @click="addFormatting('bulletList')" class="optional">
                <material-icon name="format_list_bulleted"></material-icon>
            </f7-link>
            <f7-link @click="addFormatting('numberList')" class="optional">
                <material-icon name="format_list_numbered"></material-icon>
            </f7-link>
        </f7-toolbar>
        <!-- <ul id="right-click-menu" tabindex="-1" v-if="viewMenu" @blur="closeMenu" v-bind:style="{ top:top, left:left }">
            <li class="pointer">
                <a @click="addFormatting('title')"><material-icon name="title"></material-icon></a>
            </li>
            <li class="pointer">
                <a @click="addFormatting('bold')"><material-icon name="format_bold"></material-icon></a>
            </li>
            <li class="pointer">
                <a @click="addFormatting('italic')"><material-icon name="format_italic"></material-icon></a>
            </li>
            <li class="pointer">
                <a @click="addFormatting('strikethrough')"><material-icon name="format_strikethrough"></material-icon></a>
            </li>
            <li class="pointer">
                <a @click="addFormatting('codeBlock')"><material-icon name="developer_mode"></material-icon></a>
            </li>
            <li class="pointer">
                <a @click="addFormatting('quoteBlock')"><material-icon name="format_quote"></material-icon></a>
            </li>
            <li class="pointer">
                <a @click="addFormatting('bulletList')"><material-icon name="format_list_bulleted"></material-icon></a>
            </li>
            <li class="pointer">
                <a @click="addFormatting('numberList')"><material-icon name="format_list_numbered"></material-icon></a>
            </li>
        </ul> -->
    </f7-page>
</template>

<script>
import { parse, MDtoHTML, parseLinks } from '../bin/Parser'
import { Draft, DB, RemoteDB } from '../bin/Storage'
import firebase from '../bin/Cloud'
// import Hammer from '../libs/hammer.min.js'
import _ from 'lodash'

export default {
    name: 'Editor',
    data () {
        return {
            'note': {},
            'draft': null,
            'edit': true,
            'preview': false,
            'navTitle': 'Edit note',
            'viewMenu': false,
            'top': '0px',
            'left': '0px',
            'selection': {}
        }
    },
    created () {
        firebase.auth().onAuthStateChanged((user) => {
            this.user = user || {}
            this.DB = user ? new RemoteDB(user.uid) : DB
        })
        if (Draft.getCurrentEdit()) {
            this.note = Draft.getCurrentEdit()
            this.navTitle = this.note.tags[0]
        } else {
            this.note.text = '# New Note\n'
        }
    },
    mounted () {
        /* setTimeout(() => {
            const touchController = new Hammer(document.getElementById('mainInput'), { time: 1500 })
            touchController.on('press', (element) => {
                element.x = element.srcEvent.clientX
                element.y = element.srcEvent.clientY
                this.openMenu(element)
            })
        }, 0) */
    },
    methods: {
        autosave: _.debounce(function () {
            if (this.note) {
                Draft.setCurrentEdit(this.note)
            }
        }, 500),
        capitalize (value) {
            return _.capitalize(value)
        },
        clickOnSave () {
            parse(this.note.text)
                .then(result => {
                    this.note.tags = result
                    return MDtoHTML(this.note.text)
                })
                .then(html => {
                    this.note.html = html
                    if (this.note.id) {
                        return this.DB.update(this.note.id, this.note)
                    } else {
                        return this.DB.save(this.note)
                    }
                })
                .then(() => {
                    Draft.setCurrentEdit(this.note)
                    this.navTitle = this.note.tags[0]
                    this.$f7.addNotification({
                        message: `Note saved as ${this.capitalize(this.note.tags[0])}`,
                        hold: 5000,
                        button: {
                            text: 'Ok',
                            color: 'orange'
                        }
                    })
                })
                .catch(error => {
                    console.error(error)
                })
        },
        clickOnCancel () {
            this.edit = false
            this.note = {}
            Draft.clear()
            this.note = Draft.getCurrentEdit()
            this.edit = true
            this.preview = false
            this.navTitle = 'New Note'
            this.$f7.addNotification({
                message: `New note ready`,
                hold: 2000,
                button: {
                    text: 'Ok',
                    color: 'orange'
                }
            })
        },
        clickOnPreview () {
            if (this.note.text !== '') {
                this.edit = !this.edit
                if (!this.preview) {
                    MDtoHTML(this.note.text)
                        .then(html => {
                            this.note.html = html
                            this.preview = !this.preview
                        }, error => {
                            console.error(error)
                            this.preview = !this.preview
                        })
                } else {
                    this.preview = !this.preview
                }
            }
        },
        parseHTML (source) {
            return parseLinks(source)
        },
        getSelection () {
            this.selection.text = window.getSelection().toString().trim()
            this.selection.start = document.activeElement.selectionStart
            this.selection.end = document.activeElement.selectionEnd
        },
        addFormatting (style) {
            if (this.selection.text) {
                switch (style) {
                case 'title':
                    this.selection.text = '# ' + this.selection.text + '\n'
                    break
                case 'bold':
                    this.selection.text = '**' + this.selection.text + '** '
                    break
                case 'italic':
                    this.selection.text = '_' + this.selection.text + '_ '
                    break
                case 'strikethrough':
                    this.selection.text = '~~' + this.selection.text + '~~ '
                    break
                case 'codeBlock':
                    this.selection.text = '\n```\n' + this.selection.text + '\n```\n'
                    break
                case 'quoteBlock':
                    this.selection.text = this.selection.text
                        .split('\n')
                        .map(line => '> ' + line.trim() + '\n')
                        .join('')
                    break
                case 'bulletList':
                    this.selection.text = this.selection.text
                        .split('\n')
                        .map(line => '* ' + line.trim() + '\n')
                        .join('')
                    break
                case 'numberList':
                    this.selection.text = this.selection.text
                        .split('\n')
                        .map((line, i) => (i + 1) + '. ' + line.trim() + '\n')
                        .join('')
                    break
                }
                this.note.text = this.note.text.substring(0, this.selection.start) + this.selection.text + this.note.text.substring(this.selection.end)
                Draft.setCurrentEdit(this.note)
            }
            this.closeMenu()
        },
        setMenu (top, left) {
            const largestHeight = window.innerHeight - 25
            const largestWidth = window.innerWidth - 330
            if (top > largestHeight) top = largestHeight
            if (left > largestWidth) left = largestWidth
            this.top = top + 'px'
            this.left = left + 'px'
        },
        closeMenu () {
            this.viewMenu = false
            this.selection = {}
        },
        openMenu: function (e) {
            e.preventDefault()
            this.viewMenu = true
            this.setMenu(e.y + 10, e.x)
        }
    }
}
</script>

<style scoped>
    .page-content {
        overflow-y: hidden;
    }
    .top-buttons {
        text-decoration: none;
        color: white;
        margin-right: 15px;
    }
    .editor-container {
        margin: 0;
        padding: 0;
        padding-left: 5px;
        min-height: 100%;
        display: flex;
        flex-flow: column;
    }
    #mainInput {
        flex: 1 1 auto;
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        border: none;
        overflow-y: auto;
        resize: none;
        font-size: 1.1em;;
        color: gray;
    }
    #preview {
        overflow-x: auto;
        font-size: 1.1em !important;
        color: gray;
        font-family: serif;
        text-align: justify;
        padding: 5px;
    }
    @media screen and (orientation:portrait) {
        #noteTitle {
            display: block;
        }
        #bottomToolbar {
            display: block;
        }
    }
    @media screen
        and (max-device-width: 320px) {
        .optional {
            display: none;
        }
    }
    @media screen 
        and (orientation: landscape)
        and (max-device-width: 800px) {
        #noteTitle {
            display: none;
        }
        #bottomToolbar {
            display: none;
        }
        #mainInput {
            margin-top: -51px;
            margin-bottom: -43px;
        }
        #preview {
            margin-top: -51px;
            margin-bottom: -43px;
        }
    }
    .buttons-row {
        padding: 0px;
        margin: 0px;
    }
    .list-block {
        margin: 0px;
        margin-bottom: 12px;
    }
    .list-block .item-input {
        font-size: 1em !important;
    }
    #right-click-menu{
        background: #FAFAFA;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        /* position: absolute;
        z-index: 999999; */
    }
    #right-click-menu li {
        margin: 0;
        padding: 0 6px;
        padding-top: 6px;
        display: inline-block;
        border: 1px solid #BDBDBD;
        border-right: none;
    }
    #right-click-menu li:last-child {
        border-right: 1px solid #BDBDBD;
    }
    #right-click-menu li:hover {
        background: #1E88E5;
        color: #FAFAFA;
    }
</style>