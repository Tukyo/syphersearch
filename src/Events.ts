/* 
═════════╗
| EVENTS
═════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Processes events for the application.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

// #region > Events <
//
// ━━━━┛ ▼ ┗━━━━
type ProgressCallback = (percent: number) => void;

class ProgressEventEmitter {
  private listeners: Set<ProgressCallback> = new Set();

  on(cb: ProgressCallback) {
    this.listeners.add(cb);
  }

  off(cb: ProgressCallback) {
    this.listeners.delete(cb);
  }

  emit(percent: number) {
    for (const cb of this.listeners) cb(percent);
  }
}

export const ProgressEvents = new ProgressEventEmitter();
// ━━━━┛ ▲ ┗━━━━
//
// ━━━━┛ ▼ ┗━━━━
type ValidResultCallback = (url: string) => void;

class ValidResultEventEmitter {
  private listeners: Set<ValidResultCallback> = new Set();

  on(cb: ValidResultCallback) {
    this.listeners.add(cb);
  }

  off(cb: ValidResultCallback) {
    this.listeners.delete(cb);
  }

  emit(url: string) {
    for (const cb of this.listeners) cb(url);
  }
}

export const ValidResultEvents = new ValidResultEventEmitter();
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Events ^