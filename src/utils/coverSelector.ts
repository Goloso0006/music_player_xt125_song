const defaultCovers = [
  "/default/Blessd.webp",
  "/default/COVER.webp",
  "/default/krisR.webp",
  "/default/kris_r.webp",
  "/default/loswawan.webp"
]
let lastIndex = -1

const getRandomItem = (items: string[]) => {
  if (items.length === 1) {
    return items[0]
  }

  let randomIndex = Math.floor(Math.random() * items.length)

  if (lastIndex >= 0 && randomIndex === lastIndex) {
    randomIndex = (randomIndex + 1) % items.length
  }

  lastIndex = randomIndex
  return items[randomIndex]
}

export const getRandomCover = (): string => {
  if (defaultCovers.length === 0) {
    return "/favicon.svg"
  }

  return getRandomItem(defaultCovers)
}
