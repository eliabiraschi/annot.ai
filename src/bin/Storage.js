import Dexie from 'dexie'
import shortid from 'shortid'
import _ from 'lodash'
import moment from 'moment'
import firebase from './Cloud'

class _Draft {
    constructor () {
        this._ = window.localStorage
        this._draftID = 'draft'
        this._currentEdit = 'currentEdit'
    }
    setCurrentEdit (value, check = false) {
        if (check) {
            const currentEdit = this.getCurrentEdit()
            if (!currentEdit || currentEdit.id !== value.id) {
                return this._.setItem(this._currentEdit, JSON.stringify(value))
            }
        } else {
            return this._.setItem(this._currentEdit, JSON.stringify(value))
        }
    }
    getCurrentEdit () {
        try {
            return JSON.parse(this._.getItem(this._currentEdit))
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    clear () {
        return this._.setItem(this._currentEdit, JSON.stringify({text: '# New Note\n'}))
    }
}

class LocalDB {
    constructor (DBName) {
        this._db = new Dexie(DBName)
        this._db.version(1).stores({
            notes: `id, text, html, tags, created, lastEdit, isPublic`
        })
    }
    put (newNote) {
        if (newNote.__ob__) {
            delete newNote.__ob__
        }
        newNote.id = shortid.generate()
        newNote.created = newNote.lastEdit = Date.now()
        return this._db.notes.put(newNote)
    }
    save (newNote) {
        return this.put(newNote)
    }
    update (noteId, updates) {
        updates.lastEdit = Date.now()
        return this._db.notes.update(noteId, updates)
    }
    deleteNote (noteId) {
        return this._db.notes.delete(noteId)
    }
    getOne (noteID) {
        return this._db.notes.get(noteID)
    }
    getAll () {
        return this._db.notes.toArray()
    }
    find (query) {
        return this._db.notes.where(query)
    }
    findByTag (tag) {
        return this._db.notes.filter(value => {
            return value.tags.indexOf(tag) > -1
        }).toArray()
    }
    getFullTagsList () {
        return new Promise((resolve, reject) => {
            this._db.notes.toArray()
            .then(allNotes => {
                let result = []
                allNotes.forEach(note => {
                    note.tags.forEach(tag => {
                        if (result.indexOf(tag) === -1) {
                            result.push(tag)
                        }
                    })
                })
                resolve(result)
            })
            .catch(error => {
                reject(error)
            })
        })
    }
}

export class RemoteDB extends LocalDB {
    constructor (userId) {
        super(userId)
        this.path = 'users/' + userId + '/notes/'
        this._remoteDB = firebase.database()
        setTimeout(() => {
            this._remoteDB.ref('.info/connected').on('value', snap => {
                this._isConnected = snap.val()
                if (this._isConnected) {
                    this.sync()
                } else {
                    this.setLastSync('offline')
                }
            })
        }, 0)
    }
    setLastSync (value = undefined) {
        try {
            window.localStorage.setItem('_lastSync', value || moment().format('dddd, Do MMM HH:mm'))
        } catch (error) {
            console.error(error)
        }
    }
    sync () {
        this._remoteDB.ref(this.path).on('value', snapshot => {
            this._db.notes.clear()
            _.forEach(snapshot.val(), (value, key) => {
                value['id'] = key
                this._db.notes.put(value)
            })
            this.setLastSync()
        })
    }
    put (newNote) {
        newNote.created = newNote.lastEdit = Date.now()
        if (this._isConnected) this.setLastSync()
        return this._remoteDB.ref(this.path).push(newNote)
    }
    update (noteId, updates = null) {
        if (updates) {
            updates.lastEdit = Date.now()
        }
        if (this._isConnected) this.setLastSync()
        return this._remoteDB.ref().update({
            [this.path + noteId]: updates
        })
    }
    deleteNote (noteId) {
        this._db.notes.delete(noteId)
        if (this._isConnected) this.setLastSync()
        return this.update(noteId)
    }
}

export const DB = new LocalDB('annot.ai')
export const Draft = new _Draft()
