// import React from 'react'
import React, { useState } from 'react'
import { TextField, Button } from '@material-ui/core'

import useAddPortal from '../PortalForm/useAddPortal'

import { useSelector } from 'react-redux'
import { PortalSize, Zone } from '@portaler/types'
import { RootState } from '../reducers'

import { DEFAULT_PORTAL_SIZE } from '../common/data/constants'

import FuzzySet from 'fuzzyset'

// REACT STUFF:

const FindPath = () => {
  const [displayText, setDisplayText] = useState('') /*<string[]>([])*/
  const [inputValue, setInputValue] = useState('')

  const addPortal = useAddPortal()

  const useZoneList = (): Zone[] =>
    useSelector((state: RootState) => state.zones.list)
  const zones = useZoneList()
  const zoneNames = zones.map((zone) => zone.name)
  // const newText = zoneNames.join(', ')
  // const firstElement = zones[0]
  // const firstElementString = JSON.stringify(firstElement)
  // const fES = firstElementString.toString()

  const zoneFuzzySet = FuzzySet(zones.map((zone) => zone.name))

  const handleInputChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setInputValue(event.target.value)
  }

  const handleFormSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault()

    const displayTextArray: string[] = []
    const inputString = inputValue

    try {
      const inputArray = JSON.parse(inputString)

      for (const inputObject of inputArray) {
        let from = inputObject.From
        let to = inputObject.To

        const hr = Math.floor(Number(inputObject.Hours))
        const min = Math.floor(Number(inputObject.Minutes))

        if (isNaN(hr) || hr < 0 || hr > 23) {
          displayTextArray.push(`Invalid hours value: ${inputObject.Hours}`)
          continue
        }

        if (isNaN(min) || min < 0 || min > 59) {
          displayTextArray.push(`Invalid minutes value: ${inputObject.Minutes}`)
          continue
        }

        const fromZoneMatch = zoneFuzzySet.get(from)
        if (fromZoneMatch && fromZoneMatch[0] && fromZoneMatch[0][0] >= 0.5) {
          from = fromZoneMatch[0][1]
        } else {
          displayTextArray.push(`Invalid FROM zone: ${from}`)
          continue
        }

        const toZoneMatch = zoneFuzzySet.get(to)
        if (toZoneMatch && toZoneMatch[0] && toZoneMatch[0][0] >= 0.5) {
          to = toZoneMatch[0][1]
        } else {
          displayTextArray.push(`Invalid TO zone: ${to}`)
          continue
        }

        // if (!zoneNames.includes(from)) {
        //   displayTextArray.push(`Invalid FROM zone: ${from}`)
        //   continue
        // }
        // if (!zoneNames.includes(to)) {
        //   displayTextArray.push(`Invalid TO zone: ${to}`)
        //   continue
        // }

        const str = `FROM: ${from} TO: ${to} Hours: ${hr} Minutes: ${min}`
        displayTextArray.push(str)

        addPortal({
          connection: [from, to],
          size: DEFAULT_PORTAL_SIZE as PortalSize,
          hours: hr,
          minutes: min,
        })
      }
    } catch (error) {
      displayTextArray.push('Invalid input format. Please enter valid JSON.')
      return
    }
    setDisplayText(displayTextArray.join(' | '))
  }

  return (
    <div>
      <h2>THIS PAGE IS FOR OPTATUSCHIPA USE ONLY</h2>
      <TextField
        label="Enter some text"
        value={inputValue}
        onChange={handleInputChange}
        fullWidth
        multiline
        minRows={4}
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
        onClick={handleFormSubmit}
        fullWidth
      >
        SUBMIT
      </Button>
      {displayText && <p>{displayText}</p>}
    </div>
  )
}

export default FindPath
