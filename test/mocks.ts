import { Model, RequestState } from 'src/main'
import { ActionContext } from 'vuex';

export interface MockRaw {
    id: number,
    mockNumber: number,
    mockString: string,
}

export class MockModel implements Model<MockModel, MockRaw> {
    private id: number = 0
    private mockNumber: number = 0
    private mockString: string = ''

    public getNew() {
        return new MockModel()
    }

    public fillModel(raw: MockRaw) {
        this.id = raw.id
        this.mockNumber = raw.mockNumber
        this.mockString = raw.mockString
        return this
    }

    public getRaw() {
        return {
            id: this.id,
            mockNumber: this.mockNumber,
            mockString: this.mockString,
        }
    }
}

export interface MockState {
    vuexFetchersState: Map<string, Map<Object, RequestState>>
    mockModelList: MockModel[]
}

export interface MockPayload {
    id: number
}

export const CreateMockPromise = <R>(response: R): (payload: MockPayload) => Promise<R> => {
    return (payload: MockPayload): Promise<R> => {
        return new Promise<R>((resolve, reject: any) => {
            resolve(response)
        })
    }
}

export const CreateFailingMockPromise = <R>(response: any): (payload: MockPayload) => Promise<R> => {
    return (payload: MockPayload): Promise<R> => {
        return new Promise<R>((resolve, reject: any) => {
            reject("failed the mock promise")
        })
    }
}

export const CreateSlowMockPromise = <R>(response: R): (payload: MockPayload) => Promise<R> => {
    return (payload: MockPayload): Promise<R> => {
        return new Promise<R>((resolve, reject: any) => {
            setTimeout(() => {
                resolve(response)
            }, 300)
        })
    }
}

export const MockContext: ActionContext<MockState, MockState> = {
    state: {
        vuexFetchersState: new Map(),
        mockModelList: []
    },
    rootState: {
        vuexFetchersState: new Map(),
        mockModelList: []
    },
    commit: () => {},
    dispatch: () => new Promise<any>( (resolve) => {resolve()}),
    getters: () => {},
    rootGetters: () => {}
}