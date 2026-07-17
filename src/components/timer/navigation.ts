export const TIMER_HUB_HREF = "/timer";
export const NEW_MATCH_SETUP_HREF = "/timer?novo=1";

export function shouldOpenSetup(searchParams: Pick<URLSearchParams, "get">) {
  return searchParams.get("novo") === "1";
}

export interface SetupNavigationState {
  isOpen: boolean;
  urlRequestActive: boolean;
}

export type SetupNavigationEvent =
  | { type: "open" }
  | { type: "close" }
  | { type: "url_changed"; requested: boolean };

export function createSetupNavigationState(): SetupNavigationState {
  return { isOpen: false, urlRequestActive: false };
}

export function reduceSetupNavigationState(
  state: SetupNavigationState,
  event: SetupNavigationEvent,
): SetupNavigationState {
  if (event.type === "open") return { ...state, isOpen: true };
  if (event.type === "close") return { ...state, isOpen: false };

  if (!event.requested) {
    if (!state.urlRequestActive) return state;
    return { ...state, urlRequestActive: false };
  }

  if (state.urlRequestActive) return state;
  return { isOpen: true, urlRequestActive: true };
}
