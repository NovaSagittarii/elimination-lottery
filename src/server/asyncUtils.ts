export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), time);
  });
}

/**
 * sleep until function
 * @param callback returns true when ready to continue
 */
export async function sleepUntil(callback: () => boolean) {
  return new Promise((res) => {
    const interval = setInterval(() => {
      if (callback()) res(undefined);
    }, 1000);
  });
}