import {
  ButtonGroup,
  Box,
  IconButton,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderTrack,
  RangeSliderThumb,
  Center,
  Flex,
  Text,
} from '@chakra-ui/react'
import ReactHowler from 'react-howler'
import { useEffect, useRef, useState } from 'react'
import {
  MdShuffle,
  MdSkipPrevious,
  MdOutlinePlayCircleFilled,
  MdOutlinePauseCircleFilled,
  MdOutlineRepeat,
  MdSkipNext,
} from 'react-icons/md'
import { useStoreActions } from 'easy-peasy'
import { formatTime } from '../lib/formatters'

export const Player = ({ songs, activeSong }) => {
  const [playing, setPlaying] = useState(true)
  const [index, setIndex] = useState(
    songs.findIndex((s) => s.id === activeSong.id)
  )
  const [seek, setSeek] = useState(0.0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [duration, setDuration] = useState(0.0)
  const soundRef = useRef(null)
  const repeatRef = useRef(repeat)
  const changeActiveSong = useStoreActions(
    (state: any) => state.changeActiveSong
  )

  useEffect(() => {
    let timerId

    if (playing && !isSeeking) {
      const f = () => {
        setSeek(soundRef.current.seek())
        timerId = requestAnimationFrame(f)
      }

      timerId = requestAnimationFrame(f)
    }

    return () => cancelAnimationFrame(timerId)
  }, [playing, isSeeking])

  useEffect(() => {
    changeActiveSong(songs[index])
  }, [index, changeActiveSong, songs])

  useEffect(() => {
    repeatRef.current = repeat
  }, [repeat])

  const setPlayState = (value) => {
    setPlaying(value)
  }

  const onShuffle = () => {
    setShuffle((state) => !state)
  }

  const onRepeat = () => {
    setRepeat((state) => !state)
  }

  const prevSong = () => {
    setIndex((state) => {
      return state ? state - 1 : songs.length - 1
    })
  }

  const nextSong = () => {
    setIndex((state) => {
      if (shuffle) {
        const next = Math.floor(Math.random() * songs.length)

        if (next === state) {
          nextSong()
          return
        }

        return next
      }

      return state === songs.length - 1 ? 0 : state + 1
    })
  }

  const onEnd = () => {
    if (repeatRef.current) {
      setSeek(0)
      soundRef.current.seek(0)
    } else {
      nextSong()
    }
  }

  const onLoad = () => {
    const songDuration = soundRef.current.duration()
    setDuration(songDuration)
  }

  const onSeek = (e) => {
    const parsedSeek = parseFloat(e[0])
    setSeek(parsedSeek)
    soundRef.current.seek(parsedSeek)
  }

  return (
    <Box>
      <Box>
        <ReactHowler
          ref={soundRef}
          playing={playing}
          src={activeSong?.url}
          onLoad={onLoad}
          onEnd={onEnd}
        />
      </Box>
      <Center color="gray.600">
        <ButtonGroup>
          <IconButton
            outline="none"
            variant="link"
            aria-label="shuffle"
            fontSize="24px"
            color={shuffle ? 'white' : 'gray.600'}
            onClick={onShuffle}
            icon={<MdShuffle />}
          />
          <IconButton
            outline="none"
            variant="link"
            aria-label="skip"
            onClick={prevSong}
            fontSize="24px"
            icon={<MdSkipPrevious />}
          />
          {playing ? (
            <IconButton
              outline="none"
              variant="link"
              aria-label="pause"
              fontSize="40px"
              color="white"
              icon={<MdOutlinePauseCircleFilled />}
              onClick={() => setPlayState(false)}
            />
          ) : (
            <IconButton
              outline="none"
              variant="link"
              aria-label="play"
              fontSize="40px"
              color="white"
              icon={<MdOutlinePlayCircleFilled />}
              onClick={() => setPlayState(true)}
            />
          )}
          <IconButton
            outline="none"
            variant="link"
            aria-label="next"
            fontSize="24px"
            onClick={nextSong}
            icon={<MdSkipNext />}
          />
          <IconButton
            outline="none"
            variant="link"
            aria-label="repeat"
            color={repeat ? 'white' : 'gray.600'}
            onClick={onRepeat}
            fontSize="24px"
            icon={<MdOutlineRepeat />}
          />
        </ButtonGroup>
      </Center>
      <Box color="gray.600">
        <Flex justify="center" align="center">
          <Box width="10%">
            <Text fontSize="xs">{formatTime(seek)}</Text>
          </Box>
          <Box width="80%">
            <RangeSlider
              aria-label={['min', 'max']}
              step={0.1}
              min={0}
              max={duration ?? 0}
              onChange={onSeek}
              value={[seek]}
              onChangeStart={() => setIsSeeking(true)}
              onChangeEnd={() => setIsSeeking(false)}
              id="player-range"
            >
              <RangeSliderTrack bg="gray.800">
                <RangeSliderFilledTrack bg="gray.600" />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} />
            </RangeSlider>
          </Box>
          <Box width="10%" textAlign="right">
            <Text fontSize="xs">{formatTime(duration)}</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}
