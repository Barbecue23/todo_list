class Todo < ApplicationRecord
  enum :status, { todo: "todo", doing: "doing", done: "done" }, default: :todo, validate: true

  before_validation :sync_completed_with_status

  private

  def sync_completed_with_status
    self.completed = (status == "done")
  end
end
