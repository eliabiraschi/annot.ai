import retext from 'retext'
import retextKeywords from 'retext-keywords'
import nlcstToString from 'nlcst-to-string'
import showdown from 'showdown'
import _ from 'lodash'
import { LevenshteinDistance as LD } from 'natural'
import cheerio from 'cheerio'
import xss from 'xss'

function generateTags (text) {
    return new Promise((resolve, reject) => {
        retext().use(retextKeywords).process(text, (error, file) => {
            if (error) reject(error)
            const tags = file.data.keywords.map(e => {
                let token = nlcstToString(e.matches[0].node).toLowerCase()
                const i = token.indexOf(`'`)
                return token.substring(0, i !== -1 ? i : token.length)
            })
            resolve(tags)
        })
    })
}
function generateKeyPhrases (text) {
    return new Promise((resolve, reject) => {
        retext().use(retextKeywords).process(text, (error, file) => {
            if (error) reject(error)
            const keyPhrases = file.data.keyphrases
                .map(e => e.matches[0].nodes.map(nlcstToString).join('').toLowerCase())
                .filter(k => k.split(' ').length <= 2)
            resolve(keyPhrases)
        })
    })
}

export function parse (text) {
    return new Promise((resolve, reject) => {
        let tags
        let keyPhrases
        generateTags(text)
            .then(res => {
                tags = res.filter((tag, i, arr) => {
                    let outcome = true
                    arr.every((current, j) => {
                        if (i !== j) {
                            outcome = LD(tag, current) > 1
                            return outcome
                        }
                    })
                    return outcome
                })
                return generateKeyPhrases(text)
            })
            .then(res => {
                keyPhrases = res.filter((keyPhrase, i) => {
                    let outcome = true
                    tags.every(tag => {
                        outcome = LD(keyPhrase, tag) > 1
                        return outcome
                    })
                    return outcome
                })
                return resolve(_.concat(tags, keyPhrases))
            })
    })
}

const converter = new showdown.Converter()
converter.setFlavor('github')
export function MDtoHTML (text) {
    return new Promise((resolve, reject) => {
        try {
            resolve(xss(converter.makeHtml(text)))
        } catch (error) {
            reject(error)
        }
    })
}

export function parseLinks (source) {
    const $ = cheerio.load(source)
    $('a').each(function () {
        const href = $(this).attr('href')
        $(this).attr('href', 'javascript:window.open("' + href + '")')
    })
    $('img').each(function () {
        $(this).attr('style', 'max-width: 100%')
    })
    return $.html()
}
