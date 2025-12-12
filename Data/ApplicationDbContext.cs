using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.EntityFrameworkCore;

namespace Kohviautomaadi_haldussusteem_ORM.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }   // ← исправлено здесь
        public DbSet<Category> Categories { get; set; }
        public DbSet<Drink> Drinks { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Promocode> Promocodes { get; set; }
        public DbSet<PromocodeUsage> PromocodeUsages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Настройка точности для decimal полей
            modelBuilder.Entity<Drink>()
                .Property(d => d.Price)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalPrice)
                .HasColumnType("decimal(18,2)");
                
            modelBuilder.Entity<Order>()
                .Property(o => o.DiscountAmount)
                .HasColumnType("decimal(18,2)");
                
            modelBuilder.Entity<Order>()
                .Property(o => o.FinalPrice)
                .HasColumnType("decimal(18,2)");
                
            modelBuilder.Entity<Promocode>()
                .Property(p => p.DiscountPercent)
                .HasColumnType("decimal(5,2)");
                
            modelBuilder.Entity<Promocode>()
                .Property(p => p.DiscountAmount)
                .HasColumnType("decimal(18,2)");
                
            modelBuilder.Entity<Promocode>()
                .Property(p => p.MinOrderAmount)
                .HasColumnType("decimal(18,2)");
                
            modelBuilder.Entity<PromocodeUsage>()
                .Property(pu => pu.DiscountAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Category>()
                .HasMany(d => d.Drinks)
                .WithOne(c => c.Category)
                .HasForeignKey(c => c.CategoryId);
        }
    }
}