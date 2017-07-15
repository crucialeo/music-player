var log = console.log.bind(console)
var e = sel => document.querySelector(sel)
var es = sel => document.querySelectorAll(sel)
var appendHtml = (element, html) => element.insertAdjacentHTML('beforeend', html)

var player = e('#id-audio-player')
var displayedLrc = e('#id-div-lrc')


var songs = [
    'Are You OK.mp3',
    '逍遥叹.mp3',
    'Angelica.mp3',
    'The Pirate That Should Not Be.mp3',
    'Pull up a Chair.mp3',
    '勇往直前.mp3'
]
var numberOfSongs = songs.length

// 标记播放状态，true 表示暂停状态，false 表示播放状态
var onOff = true

// 切换标题
var changeTitle = function() {
    var playingId = parseInt(player.dataset.playing)
    var srcName = songs[playingId]
    var songName = srcName.split('.')[0]
    var h1 = e('h1')
    h1.innerHTML = songName
}

// 解析歌词并插入到页面中
var insertLrc = function(id) {
    log('insertLrc id', id)
    var data = e(id)
    var gc = data.innerHTML.split('[')
    var html = ''
    for (var i = 0; i < gc.length; i++) {
        var lrcArr = gc[i].split(']')
        var time = lrcArr[0].split('.')
        var times = time[0].split(':')
        var sec = times[0] * 60 + times[1] * 1
        if (lrcArr[1]) {
            html += `<p id=${sec}>${lrcArr[1]}</p>`
        }
    }
    displayedLrc.innerHTML = html
}

// 歌词滚动
var rollLrc = function() {
    var p = es('p')
    // log('p', p, p.length, p[12], typeof(p[12]))
    var n = 0
    player.addEventListener('timeupdate', function() {
        var cur = parseInt(player.currentTime)
        var ps = document.getElementById(cur)
        // log('ps', ps)
        if (ps) {
            for (var i = 0; i < p.length; i++) {
                p[i].classList.remove('red')
            }
            ps.classList.add('red')
            if (p[5+n].id == cur && p[5+n]) {
                displayedLrc.style.top = -33 * n + 'px'
                n ++
            }
        }
    })
}

// 给控制按钮绑定事件
var bindPlayEvents = function() {
    var playButton = e('#id-button-play')
    playButton.addEventListener('click', function() {
        if (onOff) {
            player.play()
            playButton.innerHTML = '暂停'
            changeTitle()
            rollLrc()
            // log('now playing', player.paused)
        } else {
            player.pause()
            playButton.innerHTML = '播放'
            // log('now paused', player.paused)
        }
        onOff = !onOff
    })

    // 下一首按钮
    var nextButton = e('#id-button-next')
    nextButton.addEventListener('click', function() {
        var playingId = parseInt(player.dataset.playing)
        var i = (playingId + 1) % numberOfSongs
        player.dataset.playing = i
        var newSrc = songs[i]
        player.src = 'src/' + newSrc
        var lrcId = '#id-textarea-lrc-' + String(i)
        insertLrc(lrcId)
        if (onOff) {
            log('现在是暂停状态时候的下一首')
            changeTitle()
        } else {
            player.play()
            changeTitle()
        }
    })

    // 上一首按钮
    var prevButton = e('#id-button-prev')
    prevButton.addEventListener('click', function() {
        var playingId = parseInt(player.dataset.playing)
        var i = (playingId - 1 + numberOfSongs) % numberOfSongs
        player.dataset.playing = i
        var newSrc = songs[i]
        player.src = 'src/' + newSrc
        var lrcId = '#id-textarea-lrc-' + String(i)
        insertLrc(lrcId)
        if (onOff) {
            log('现在是暂停状态时候的上一首')
            changeTitle()
        } else {
            player.play()
            changeTitle()
        }
    })
}

var bindEvents = function() {
    insertLrc('#id-textarea-lrc-0')
    bindPlayEvents()
}

var __main = function() {
    bindEvents()
}

__main()
