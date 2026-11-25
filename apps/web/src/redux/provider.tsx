'use client'

import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import store, { persistor } from "@/redux/store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Toaster position="top-right" richColors />
            {children}
        </PersistGate>
    </Provider>
}
