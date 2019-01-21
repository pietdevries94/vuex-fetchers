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
    vuexFetchersState: Map<string, Map<string, RequestState>>
}

// S: state, RS: root state
export default class <S extends FetcherState, RS> {
    // P: payload, R: raw response, M: model response
    public createSingleFetcher<P, R, M extends Model<M, R>>(force: boolean, mutationName: string, call: (payload: P) => Promise<R>, modelFactory: () => M): Action<S, RS> {
        const parser = (raw: R): M => {
            const model = modelFactory()
            return model.fillModel(raw)
        }
        return this.createFetcher<P, R, M>(force, mutationName, call, parser, modelFactory())
    }

    // P: payload, R: raw response, M: model response
    public createBulkFetcher<P, R, M extends Model<M, R>>(force: boolean, mutationName: string, call: (payload: P) => Promise<R[]>, modelFactory: () => M): Action<S, RS> {
        const parser = (raw: R[]): M[] => {
            return raw.map((r): M => {
                const model = modelFactory()
                return model.fillModel(r)
            })
        }

        return this.createFetcher<P, R[], M[]>(force, mutationName, call, parser, [])
    }

    public createStateInvalidator<P>(mutationName: string): Action<S, RS> {
        return async (context: ActionContext<S, RS>, payload: P) => {
            const jsonPayload = JSON.stringify(payload)
            context.state.vuexFetchersState.get(mutationName)!.delete(jsonPayload)
        }
    }

    private createFetcher<P, R, M>(force: boolean, mutationName: string, call: (payload: P) => Promise<R>, parser: (raw: R) => M, placeholder: M): Action<S, RS> {
        return async (context: ActionContext<S, RS>, payload: P) => {
            const jsonPayload = JSON.stringify(payload)
            const currentState = this.getRequestState(context.state, mutationName, jsonPayload)

            if (!force && [RequestState.Pending, RequestState.Success].includes(currentState)) { return }

            context.commit(mutationName, placeholder)
            this.setRequestState(context.state, mutationName, jsonPayload, RequestState.Pending)

            try {
                const raw = await call(payload)
                this.setRequestState(context.state, mutationName, jsonPayload, RequestState.Success)
                context.commit(mutationName, parser(raw))
            } catch (err) {
                this.setRequestState(context.state, mutationName, jsonPayload, RequestState.Error)
                throw err
            }
        }
    }

    private getRequestState(state: FetcherState, mutationName: string, payload: string): RequestState {
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

    private setRequestState(state: FetcherState, mutationName: string, payload: string, requestState: RequestState) {
        state.vuexFetchersState.get(mutationName)!.set(payload, requestState)
    }
}
