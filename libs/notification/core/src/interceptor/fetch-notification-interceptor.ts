/*
 *    Copyright 2022 CROZ d.o.o, the original author or authors.
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

import { isNotificationResponse } from "../api/notification-type-guards";
import { useNotificationStore } from "../store/notification-store";

/**
 * Fetch API interceptor which clones the response and checks
 * whether the response matches the proposed notification format.
 *
 * @returns A function which can be called to register the interceptor.
 */
export const fetchNotificationInterceptor = () => {
  window.fetch = new Proxy(window.fetch, {
    apply(fetch, that, request) {
      // @ts-ignore
      const result = fetch.apply(that, request);

      result.then((response) => response.clone().json())
        .then((body) => {
          if (isNotificationResponse(body)) {
            useNotificationStore.getState().add(body.notification);
          }
        });

      return result;
    },
  });
};
