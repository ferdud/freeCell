import { Reducer, AnyAction } from 'redux'
import * as actions from './actions'
import { Card, FreeCell } from '../../types'
import { dealCards } from '../../utils/game'
import { ContainerType } from '../../constants/containers'
import _ from 'lodash'
import { DECK } from '../../constants/deck'

export type GameState = {
  freeCells: FreeCell[]
  foundation: {
    C: Card[]
    D: Card[]
    H: Card[]
    P: Card[]
  }
  cascades: Card[][]
  draggedCard: Card | null
  numberOfSteps: number
}

export const initState: GameState = {
  freeCells: [null, null, null, null],
  foundation: {
    C: [],
    D: [],
    H: [],
    P: []
  },
  cascades: dealCards(),
  draggedCard: null,
  numberOfSteps: 0
}

export const gameReducer: Reducer<GameState, AnyAction> = (state = initState, action) => {
  switch (action.type) {
    case actions.DEAL_CARDS: {
      return {
        ...initState,
        cascades: dealCards(action.payload)
      }
    }
    case actions.CARD_CLICK: {
      const { cardId, cascadeIndex } = action.payload
      if (!cascadeIndex) {
        return state
      }
      const freeIndex = _.indexOf(state.freeCells, null)

      let cascades = [...state.cascades]
      let newCascade = cascades[cascadeIndex]
      newCascade = _.slice(newCascade, 0, newCascade.length - 1)
      cascades[cascadeIndex] = newCascade

      if (freeIndex > -1) {
        let freeCells = [...state.freeCells]
        freeCells[freeIndex] = DECK[cardId]
        return {
          ...state,
          freeCells: [...freeCells],
          cascades: cascades,
          numberOfSteps: state.numberOfSteps + 1
        }
      } else {
        return state
      }
    }
    case actions.MOVE_CARD: {
      const { source, destination, draggableId } = action.payload
      let tempState = { ...state, draggedCard: null, numberOfSteps: state.numberOfSteps + 1 }
      if (destination == null) {
        return tempState
      }
      const sourceId = source.droppableId
      const sourceContainerType = sourceId.substring(0, 1)
      const sourceContainerIdentifier = sourceId.substring(1, 2)
      const destinationId = destination.droppableId
      const destinationContainerType = destinationId.substring(0, 1)
      const destinationContainerIdentifier = destinationId.substring(1, 2)
      let cascades = [...state.cascades]
      let foundation = { ...state.foundation }
      let freeCells = [...state.freeCells]
      switch (sourceContainerType) {
        case ContainerType.Cascade: {
          let newCascade = cascades[sourceContainerIdentifier]
          newCascade = _.slice(newCascade, 0, newCascade.length - 1)
          cascades[sourceContainerIdentifier] = newCascade
          tempState = {
            ...tempState,
            cascades: cascades
          }
          break
        }
        case ContainerType.Foundation: {
          //@ts-ignore
          let newFoundation = foundation[sourceContainerIdentifier]
          newFoundation = _.slice(newFoundation, 0, newFoundation.length - 1)
          //@ts-ignore
          foundation[sourceContainerIdentifier] = newFoundation
          tempState = {
            ...tempState,
            foundation
          }
          break
        }
        case ContainerType.FreeCell: {
          freeCells[sourceContainerIdentifier] = null
          tempState = {
            ...tempState,
            freeCells: [...freeCells]
          }
          break
        }
        default: {
          //do nothing
        }
      }
      switch (destinationContainerType) {
        case ContainerType.Cascade: {
          let newCascade = cascades[destinationContainerIdentifier]
          newCascade = _.concat(newCascade, [DECK[draggableId]])
          cascades[destinationContainerIdentifier] = newCascade
          tempState = {
            ...tempState,
            cascades: cascades
          }
          break
        }
        case ContainerType.Foundation: {
          //@ts-ignore
          let newFoundation = foundation[destinationContainerIdentifier]
          newFoundation = _.concat(newFoundation, [DECK[draggableId]])
          //@ts-ignore
          foundation[destinationContainerIdentifier] = newFoundation
          tempState = {
            ...tempState,
            foundation: foundation
          }
          break
        }
        case ContainerType.FreeCell: {
          freeCells[destinationContainerIdentifier] = DECK[draggableId]
          tempState = {
            ...tempState,
            freeCells: [...freeCells]
          }
          break
        }
        default: {
          //do nothing
        }
      }
      return tempState
    }
    case actions.SET_DRAGGED_CARD: {
      const { draggableId } = action.payload
      return {
        ...state,
        draggedCard: DECK[draggableId]
      }
    }
    default:
      return state
  }
}
