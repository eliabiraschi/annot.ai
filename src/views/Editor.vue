<template>
    <f7-page name="editor">
        <f7-navbar id="noteTitle" :title="capitalize(navTitle)" back-link="Back" sliding data-ignore-cache="true" data-force="true">
            <f7-nav-right>
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
                @select="getSelection()">
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
    </f7-page>
</template>

<script>
import { parse, MDtoHTML, parseLinks } from '../bin/Parser'
import { Draft, DB, RemoteDB } from '../bin/Storage'
import firebase from '../bin/Cloud'
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
            this.navTitle = this.note.tags[0] || 'New Note'
        } else {
            this.note.text = '# New Note\n'
        }
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
        }
    }
}
</script>

<style scoped>
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
        padding-bottom: 10em;
    }
    #preview {
        overflow-x: auto;
        font-size: 1.1em !important;
        color: gray;
        font-family: serif;
        text-align: justify;
        padding: 5px;
    }
    @media screen
    and (orientation:portrait) {
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
</style>