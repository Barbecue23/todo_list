class AddStatusToTodos < ActiveRecord::Migration[8.0]
  def up
    add_column :todos, :status, :string, default: "todo", null: false unless column_exists?(:todos, :status)
    add_index :todos, :status unless index_exists?(:todos, :status)

    execute <<~SQL
      UPDATE todos
      SET status = 'done'
      WHERE completed IS TRUE
    SQL
  end

  def down
    remove_index :todos, :status if index_exists?(:todos, :status)
    remove_column :todos, :status if column_exists?(:todos, :status)
  end
end
