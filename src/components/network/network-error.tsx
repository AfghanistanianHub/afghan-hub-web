"use client";
import { useNetworkCopy } from "./use-network-copy";
export function NetworkError({messageKey}:{messageKey:"requestsError"|"connectionsError"|"directoryError"}) {
 const {copy}=useNetworkCopy();
 return <span>{copy[messageKey]}</span>;
}
