import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["lane"]
  static values = { csrfToken: String }

  connect() {
    this.draggedCard = null
  }

  dragStart(event) {
    const card = event.currentTarget
    this.draggedCard = card

    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", card.dataset.todoId)

    card.classList.add("opacity-60", "scale-[0.99]")
  }

  dragEnd(event) {
    event.currentTarget.classList.remove("opacity-60", "scale-[0.99]")
    this.clearLaneHighlights()
    this.draggedCard = null
  }

  dragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  dragEnter(event) {
    event.preventDefault()
    event.currentTarget.classList.add("ring-2", "ring-sky-300", "ring-offset-2")
  }

  dragLeave(event) {
    const lane = event.currentTarget

    if (!lane.contains(event.relatedTarget)) {
      lane.classList.remove("ring-2", "ring-sky-300", "ring-offset-2")
    }
  }

  async drop(event) {
    event.preventDefault()

    const lane = event.currentTarget
    lane.classList.remove("ring-2", "ring-sky-300", "ring-offset-2")

    const nextStatus = lane.dataset.status
    const cardId = event.dataTransfer.getData("text/plain")
    const card = this.draggedCard || this.element.querySelector(`[data-todo-id="${cardId}"]`)

    if (!card) {
      return
    }

    const previousLane = card.parentElement
    const previousStatus = card.dataset.status

    if (previousStatus === nextStatus) {
      lane.prepend(card)
      return
    }

    lane.prepend(card)
    this.applyCardStyle(card, nextStatus)

    try {
      await this.persistStatus(card, nextStatus)
    } catch (_error) {
      previousLane.prepend(card)
      this.applyCardStyle(card, previousStatus)
      alert("Move failed. Please try again.")
    }
  }

  applyCardStyle(card, status) {
    card.dataset.status = status

    card.classList.remove("bg-green-100", "border-green-300", "bg-white", "border-slate-200")

    if (status === "done") {
      card.classList.add("bg-green-100", "border-green-300")
    } else {
      card.classList.add("bg-white", "border-slate-200")
    }

    const badge = card.querySelector("span")
    if (badge) {
      badge.textContent = status
    }
  }

  async persistStatus(card, status) {
    const response = await fetch(`${card.dataset.updateUrl}.json`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-Token": this.csrfTokenValue
      },
      body: JSON.stringify({ todo: { status } })
    })

    if (!response.ok) {
      throw new Error("Request failed")
    }
  }

  clearLaneHighlights() {
    this.laneTargets.forEach((lane) => {
      lane.classList.remove("ring-2", "ring-sky-300", "ring-offset-2")
    })
  }
}
