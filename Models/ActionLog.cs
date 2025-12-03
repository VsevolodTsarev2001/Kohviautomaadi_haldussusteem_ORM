namespace Kohviautomaadi_haldussusteem_ORM.Models

{
    public class ActionLog
    {
        public int Id { get; set; }
        public string Action { get; set; }
        public string ObjectType { get; set; }
        public int ObjectId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public int UserId { get; set; }
        public User User { get; set; }
    }
}
