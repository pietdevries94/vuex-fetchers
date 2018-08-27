import { Action, ActionContext } from 'vuex'

// R: raw response
interface Model<Self, R> {
    getNew(): Self
    fillModel(raw: R): Self
    getRaw(): R
}

enum RequestState {
    Pending,
    Success,
    Error,
    Cancelled,
}

interface FetcherState {
    vuexFetchersState: Map<string, Map<Object, RequestState>>
}

// S: state, RS: root state
export class FetchFactory<S extends FetcherState, RS> {
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
            try {
                const raw = await call(payload)
                context.commit(mutationName, parser(raw))
            } catch (err) {
                alert(err)
            }
        }
    }
}
