import { useEffect, useRef } from 'react'
import { Global, css } from '@emotion/core'
import getUserMedia from 'getusermedia'
import styled from '@emotion/styled'

const Page = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100vw',
  height: '100vh',
  flexDirection: 'column',
  margin: 0,
  background: 'black',
  color: 'white',
  fontFamily: 'Menlo',
  overflow: 'hidden'
})

const Heading = styled.h1({
  fontWeight: 'normal'
})

const Button = styled.button({
  display: 'inline-block',
  background: 'transparent',
  border: 'solid 2px white',
  color: 'white',
  padding: '5px 10px',
  textTransform: 'uppercase',
  margin: '10px'
})

const PreviewContainer = styled.div({
  textAlign: 'center'
})

const Preview = styled.div({
  width: '400px',
  border: 'solid 2px white',
  margin: '20px 0'
})

function Index() {
  let recordRtc
  let waveSurfer
  let canvasToImage
  let recorder
  let waver

  const recordBtn = useRef()
  const wave = useRef()

  useEffect(() => {
    recordRtc = require('recordrtc')
    waveSurfer = require('wavesurfer.js')
    canvasToImage = require('canvas-to-image')

    waver = waveSurfer.create({
      container: wave.current,
      waveColor: 'violet',
      progressColor: 'purple',
      barWidth: 10,
      height: 250
    })
  })

  function start() {
    getUserMedia(
      {
        video: false,
        audio: true
      },
      (err, stream) => {
        if (err) {
          console.log('User media failed')
          console.log(err)
        } else {
          recordBtn.current.innerHTML = 'Recording...'
          recorder = recordRtc(stream, {
            type: 'audio',
            recorderType: recordRtc.StereoAudioRecorder
          })

          recorder.startRecording()
        }
      }
    )
  }

  function stop() {
    recorder.stopRecording(blob => {
      recordBtn.current.innerHTML = 'Record'
      recorder.getDataURL(data => {
        drawWaveForm(data)
      })
    })
  }

  function play() {
    waver.play()
  }

  function download() {
    wave.current.querySelector('canvas').id = 'canvas'
    canvasToImage('canvas', {
      name: 'sonicgram',
      type: 'png',
      quality: 1
    })
  }

  function drawWaveForm(data) {
    waver.empty()
    waver.load(data)
  }

  return (
    <Page>
      <Global
        styles={css`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }
        `}
      />
      <Heading>∿ SonicGram ∿</Heading>
      <div>
        <Button ref={recordBtn} onClick={start}>
          Record
        </Button>
        <Button onClick={stop}>Stop</Button>
      </div>
      <PreviewContainer>
        <Preview ref={wave} />
        <div>
          <Button onClick={play}>Play</Button>
          <Button onClick={download}>Download</Button>
        </div>
      </PreviewContainer>
    </Page>
  )
}

export default Index
