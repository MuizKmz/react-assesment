/** Every async flow in the store moves through these four states. */
export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
