class CreateTodos < ActiveRecord::Migration[8.0]
  def change
    create_table :todos, if_not_exists: true do |t|
      t.string :title
      t.text :description
      t.boolean :completed
      t.datetime :due_date

      t.timestamps
    end
  end
end
