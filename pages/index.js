import { useEffect, useRef } from 'react'
import { Global, css } from '@emotion/core'
import getUserMedia from 'getusermedia'
import Sentiment from 'sentiment'
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
  let vsr
  let recognizer
  let waver

  const sentiment = new Sentiment()

  const recordBtn = useRef()
  const wave = useRef()
  const result = useRef()
  const score = useRef()

  useEffect(() => {
    recordRtc = require('recordrtc')
    waveSurfer = require('wavesurfer.js')
    canvasToImage = require('canvas-to-image')
    vsr = require('voice-speech-recognition')

    waver = waveSurfer.create({
      container: wave.current,
      waveColor: 'violet',
      progressColor: 'purple',
      barWidth: 10,
      height: 250
    })

    recognizer = vsr.voiceSpeechRecognition()
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
          recognizer.startRecognition()

          recognizer.addEventListener('end', () => {
            const sentimentAnalysis = sentiment.analyze(
              recognizer.finalRecognizing
            )
            result.current.innerHTML = recognizer.finalRecognizing
            score.current.innerHTML = `Sentiment Score: ${
              sentimentAnalysis.score
            }`
            console.log(sentiment.analyze(recognizer.finalRecognizing))
          })
        }
      }
    )
  }

  function stop() {
    recorder.stopRecording(blob => {
      recognizer.stopRecognition()
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
        <p ref={result} />
        <p ref={score} />
        <div>
          <Button onClick={play}>Play</Button>
          <Button onClick={download}>Download</Button>
        </div>
      </PreviewContainer>
    </Page>
  )
}

export default Index
