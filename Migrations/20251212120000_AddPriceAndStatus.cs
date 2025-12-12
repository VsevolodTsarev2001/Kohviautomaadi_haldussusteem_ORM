using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kohviautomaadi_haldussusteem_ORM.Migrations
{
    /// <inheritdoc />
    public partial class AddPriceAndStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Добавляем Price к Drinks, если колонки нет
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Drinks]') AND name = 'Price')
                BEGIN
                    ALTER TABLE [Drinks] ADD [Price] decimal(18,2) NOT NULL DEFAULT 0;
                END
            ");

            // Добавляем TotalPrice к Orders, если колонки нет
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'TotalPrice')
                BEGIN
                    ALTER TABLE [Orders] ADD [TotalPrice] decimal(18,2) NOT NULL DEFAULT 0;
                END
            ");

            // Добавляем Status к Orders, если колонки нет
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'Status')
                BEGIN
                    ALTER TABLE [Orders] ADD [Status] nvarchar(50) NOT NULL DEFAULT 'Принят';
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Price",
                table: "Drinks");

            migrationBuilder.DropColumn(
                name: "TotalPrice",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Orders");
        }
    }
}
