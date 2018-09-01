import { Action, ActionContext } from 'vuex'

// R: raw response
export interface Model<Self, R> {
    getNew(): Self
    fillModel(raw: R): Self
    getRaw(): R
}

export enum RequestState {
    Pending,
    Success,
    Error,
    Cancelled,
    NotStarted,
}

interface FetcherState {
    vuexFetchersState: Map<string, Map<any, RequestState>>
}

// S: state, RS: root state
export default class<S extends FetcherState, RS> {
    // P: payload, R: raw response, M: model response
    public createSingleFetcher<P, R, M extends Model<M, R>> (mutationName: string, call: (payload: P) => Promise<R>, modelFactory: () => M): Action<S, RS> {
        return this.createFetcher<P, R, M>(mutationName, call, modelFactory().fillModel)
    }

    // P: payload, R: raw response, M: model response
    public createBulkFetcher<P, R, M extends Model<M, R>> (mutationName: string, call: (payload: P) => Promise<R[]>, modelFactory: () => M): Action<S, RS> {
        const parser = (raw: R[]): M[] => {
            return raw.map((r): M => {
                return modelFactory().fillModel(r)
            })
        }

        return this.createFetcher<P, R[], M[]>(mutationName, call, parser)
    }

    private createFetcher<P, R, M> (mutationName: string, call: (payload: P) => Promise<R>, parser: (raw: R) => M): Action<S, RS> {
        return async (context: ActionContext<S, RS>, payload: P) => {
            const currentState = this.getRequestState(context.state, mutationName, payload)

            if ([RequestState.Pending, RequestState.Success].includes(currentState)) { return }

            this.setRequestState(context.state, mutationName, payload, RequestState.Pending)

            try {
                const raw = await call(payload)
                this.setRequestState(context.state, mutationName, payload, RequestState.Success)
                context.commit(mutationName, parser(raw))
            } catch (err) {
                this.setRequestState(context.state, mutationName, payload, RequestState.Error)
            }
        }
    }

    private getRequestState(state: FetcherState, mutationName: string, payload: any): RequestState {
        let mutationMap = state.vuexFetchersState.get(mutationName)
        if (mutationMap === undefined) {
            state.vuexFetchersState.set(mutationName, new Map())
            mutationMap = state.vuexFetchersState.get(mutationName)
        }
        let requestState = mutationMap!.get(payload)
        if (requestState === undefined) {
            mutationMap!.set(payload, RequestState.NotStarted)
            requestState = mutationMap!.get(payload)
        }

        return requestState!
    }

    private setRequestState(state: FetcherState, mutationName: string, payload: any, requestState: RequestState) {
        state.vuexFetchersState.get(mutationName)!.set(payload, requestState)
    }
}
