from app.models.database import Base, engine

def check_models():
    print("Models registered with SQLAlchemy Base:")
    for table_name, table in Base.metadata.tables.items():
        print(f"\nTable: {table_name}")
        print("Columns:")
        for column in table.columns:
            print(f"  - {column.name} ({column.type})")
            if column.primary_key:
                print("    (Primary Key)")
            if column.foreign_keys:
                for fk in column.foreign_keys:
                    print(f"    (Foreign Key: {fk.target_fullname})")

if __name__ == "__main__":
    check_models()
